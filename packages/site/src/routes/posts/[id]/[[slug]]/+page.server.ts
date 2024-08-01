import {compareAsc, formatISO, parseISO} from 'date-fns'
import {cwd} from 'node:process'
import type {EntryGenerator, PageServerLoad} from './$types'
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs'
import {HBlob, notion} from '~/lib/server/constants.ts'
import {HLogger} from '@hrishikeshk/utils'
import {join} from 'node:path'
import {slugify} from '~/lib/functions.ts'
import type {TNBCode, TNBHeading, TNBImage, TNBlobList, TNBlock, TNBParagraph, TNCache, TNPage, TNRes} from '~/lib/types.ts'
import wretch from 'wretch'

const cache_dir = join(cwd(), '.svelte-kit/cache')
const all_posts_cache_file = join(cache_dir, 'all_posts.json')
const logger = new HLogger('/posts/[id]/[[slug]]/+page.server.ts')

if (!existsSync(cache_dir)) {
  try {
    logger.info(`${cache_dir} missing, creating`)
    mkdirSync(cache_dir)
    logger.success(`${cache_dir} created`)
  } catch {
    logger.warn(`failed to create ${cache_dir}, build will proceed without cache`)
  }
}

export const entries : EntryGenerator = async () => {

  let all_posts : TNRes<'page_or_database', Pick<TNPage, 'cover' | 'icon' | 'object' | 'parent' | 'properties' | 'public_url' | 'url'>>

  try {
    logger.info('fetching entries to prerender')
    all_posts = await notion.post(null, '/databases/ee93ad0cead84102868aae5665d8d2d1/query').json()
    logger.success(`fetched ${all_posts.results.length} total entries`)
  } catch (e) {
    logger.error('failed to fetch entries')
    throw e
  }

  const all_posts_filtered = all_posts.results.filter(p => !p.archived && !p.in_trash && p.properties.Status.status.name === 'Published')

  try {
    logger.info(`writing ${all_posts_filtered.length} filtered entries to ${all_posts_cache_file}`)
    writeFileSync(all_posts_cache_file, JSON.stringify(all_posts_filtered.map(p => ({
      id: p.id,
      slug: slugify(p.properties.Title.title[0].plain_text),
      updated_at: p.last_edited_time
    }))), {
      encoding: 'utf-8'
    })
    logger.success(`${all_posts_cache_file} wrote successfully`)
  } catch (e) {
    logger.error(`failed to write ${all_posts_cache_file} or encode data as JSON`)
    throw e
  }

  return all_posts_filtered.map(p => ({
    id: p.id
  })).concat(all_posts_filtered.map(p => ({
    id: p.id,
    slug: slugify(p.properties.Title.title[0].plain_text)
  })))

}

export const load : PageServerLoad = async event => {

  logger.prefix = `/${Object.values(event.params).join('/')}/`

  const post_cache_file = join(cache_dir, `${event.params.id}.json`)

  let all_post_cache : Array<{
    id : string
    slug : string
    updated_at: string
  }>

  let post_cache : TNCache

  if (!existsSync(all_posts_cache_file)) {
    logger.error(`${all_posts_cache_file} missing, this is unexpected`)
    throw new Error(`${all_posts_cache_file} missing`)
  }

  try {
    logger.info(`reading ${all_posts_cache_file}`)
    all_post_cache  = JSON.parse(readFileSync(all_posts_cache_file, {
      encoding: 'utf-8'
    }))
    logger.success(`read ${all_post_cache.length} posts from cache`)
  } catch (e) {
    logger.error(`failed to read ${all_posts_cache_file} or parse it as JSON`)
    throw e
  }

  logger.info(`looking up ${event.params.id} in ${all_posts_cache_file}`)
  const post_from_all_post_cache = all_post_cache.find(p => p.id === event.params.id)

  if (!post_from_all_post_cache) {
    logger.error(`${event.params.id} missing in ${all_posts_cache_file}, this is unexpected`)
    throw new Error(`${event.params.id} missing`)
  }

  logger.success(`found ${event.params.id} in ${all_posts_cache_file}`)

  if (existsSync(post_cache_file)) {
    try {
      logger.info(`cache found at ${post_cache_file}, reading it`)
      post_cache = JSON.parse(readFileSync(post_cache_file, {
        encoding: 'utf-8'
      }))
      logger.success(`cache read, cached at ${post_cache.cached_at}`)
    } catch (e) {
      logger.error(`failed to read ${post_cache_file} or parse it as JSON`)
      throw e
    }
  } else {
    logger.warn(`${post_cache_file} missing, generating cache`)
    post_cache = await generate_cached_entry(event.params.id, post_cache_file)
    return {
      post: {
        blocks: post_cache.blocks,
        id: post_cache.id,
        slug: post_cache.slug,
        title: post_cache.title
      }
    }
  }

  logger.info(`checking freshness of ${post_cache_file}`)

  /* 1 means first date is after second date: https://date-fns.org/docs/compareAsc */
  if (compareAsc(parseISO(post_cache.cached_at), parseISO(post_from_all_post_cache.updated_at)) !== 1) {
    logger.warn(`${post_cache_file} is stale, generating fresh cache`)
    post_cache = await generate_cached_entry(event.params.id, post_cache_file)
  } else {
    logger.success(`${post_cache_file} is fresh`)
  }

  return {
    post: {
      blocks: post_cache.blocks,
      id: post_cache.id,
      slug: post_cache.slug,
      title: post_cache.title
    }
  }
}

async function generate_cached_entry(id : string, file : string) : Promise<TNCache> {

  const blob_store = new HBlob('img')
  let blob_list : TNBlobList

  let post_blocks : TNRes<'block', {
    has_children : boolean
    object : 'block'
    parent : {
      page_id : string
      type : 'page_id'
    }
  } & TNBCode<'typescript'> | TNBHeading<1> | TNBHeading<2> | TNBHeading<3> | TNBImage | TNBParagraph>

  let post_info : TNPage

  try {
    logger.info('checking existing blobs for current page')
    blob_list = await blob_store.list(id)
    logger.success(`found ${blob_list.blobs.length} blobs`)
  } catch (e) {
    logger.error(`failed to fetch blobs list`)
    throw e
  }

  if (blob_list.blobs.length) {
    for (const blob of blob_list.blobs) {
      try {
        logger.warn(`deleting blobs ${blob.key} as it's likely stale`)
        await blob_store.delete(blob.key)
        logger.success(`deleted ${blob.key}`)
      } catch (e) {
        throw  e
      }
    }
  } else {
    logger.success(`no blobs to delete`)
  }

  try {
    logger.info('fetching blocks from Notion')
    post_blocks = await notion.get(`/blocks/${id}/children`).json()
    logger.success(`received ${post_blocks.results.length} blocks`)
  } catch (e) {
    logger.error('failed to fetch blocks')
    throw e
  }

  try {
    logger.info('fetching info from Notion')
    post_info = await notion.get(`/pages/${id}`).json<TNPage>()
    logger.success('received info from Notion')
  } catch (e) {
    logger.error('failed to fetch post info')
    throw e
  }

  const blocks = await Promise.all(post_blocks.results.map(async block => {

    logger.info(`processing block ${block.id} of type ${block.type}`)

    if ('code' in block) {
      return {
        id: block.id,
        language : block.code.language,
        text: block.code.rich_text[0].plain_text,
        type: 'code'
      }
    }

    if ('heading_1' in block) {
      return {
        id: block.id,
        level: 1,
        text: block.heading_1.rich_text[0].plain_text,
        type: 'heading',
      }
    }

    if ('heading_2' in block) {
      return {
        id: block.id,
        level: 2,
        text: block.heading_2.rich_text[0].plain_text,
        type: 'heading',
      }
    }

    if ('heading_3' in block) {
      return {
        id: block.id,
        level: 2,
        text: block.heading_3.rich_text[0].plain_text,
        type: 'heading',
      }
    }

    if ('image' in block) {

      let img : Blob

      try {
        logger.info('fetching image')
        img = await wretch(block.image.file.url).get().blob()
        logger.success(`fetched image of size ${img.size} bytes`)
      } catch (e) {
        logger.error('failed to fetch image')
        throw e
      }

      try {
        logger.info(`uploading ${block.id} to blobs`)
        await blob_store.set(`${post_info.id}/${block.id}`, img)
        logger.success('image uploaded')
      } catch (e) {
        logger.error(`failed to upload ${block.id}`)
        throw e
      }

      return {
        id: block.id,
        type: 'image'
      }

    }

    if ('paragraph' in block) {
      if (block.paragraph.rich_text.length) {
        return {
          id: block.id,
          text: block.paragraph.rich_text[0].plain_text,
          type: 'paragraph'
        }
      } else {
        logger.warn(`skipping paragraph ${block.id} as it's empty`)
      }
    }

  })) as Array<TNBlock>

  const title = post_info.properties.Title.title[0].plain_text

  const post_cache : TNCache = {
    blocks: blocks.filter(Boolean),
    cached_at: formatISO(Date.now()),
    id,
    slug: slugify(title),
    title
  }

  try {
    logger.info(`writing cache to ${file}`)
    writeFileSync(file, JSON.stringify(post_cache), {
      encoding: 'utf-8'
    })
    logger.success(`successfully wrote ${file}`)
  } catch (e) {
    logger.error(`failed to write ${file} or stringify data as JSON`)
    throw e
  }

  return post_cache

}