import {
  all_posts_cache_file,
  cache_dir,
  HBlob,
  notion
} from '~/lib/server/constants.ts'
import {compareAsc, formatISO, parseISO} from 'date-fns'
import type {EntryGenerator, PageServerLoad} from './$types'
import {existsSync, readFileSync, writeFileSync} from 'node:fs'
import {HLogger} from '@hrishikeshk/utils'
import imageSize from 'image-size'
import type {ISizeCalculationResult} from 'image-size/dist/types/interface.d.ts'
import {load_all_posts} from '~/lib/server/functions.ts'
import {join} from 'node:path'
import {slugify} from '~/lib/functions.ts'
import type {
  TNBCode,
  TNBHeading,
  TNBImage,
  TNBlobList,
  TNBlock,
  TNBParagraph,
  TNCache,
  TNPage,
  TNRes
} from '~/lib/types.ts'
import wretch from 'wretch'

const logger = new HLogger('/posts/[id]/[[slug]]/+page.server.ts')

export const entries: EntryGenerator = async () => {
  const all_posts_cache = await load_all_posts(logger)

  return all_posts_cache.posts
    .map((p) => ({
      id: p.id
    }))
    .concat(
      all_posts_cache.posts.map((p) => ({
        id: p.id,
        slug: p.slug
      }))
    )
}

export const load: PageServerLoad = async (event) => {
  logger.prefix = `/${Object.values(event.params).join('/')}/`

  const post_cache_file = join(cache_dir, `${event.params.id}.json`)

  let post_cache: TNCache

  const all_posts_cache = await load_all_posts(logger)

  logger.info(`looking up ${event.params.id} in ${all_posts_cache_file}`)
  const post_from_all_post_cache = all_posts_cache.posts.find(
    (p) => p.id === event.params.id
  )

  if (!post_from_all_post_cache) {
    logger.error(
      `${event.params.id} missing in ${all_posts_cache_file}, this is unexpected`
    )
    throw new Error(`${event.params.id} missing`)
  }

  logger.success(`found ${event.params.id} in ${all_posts_cache_file}`)

  if (existsSync(post_cache_file)) {
    try {
      logger.info(`cache found at ${post_cache_file}, reading it`)
      post_cache = JSON.parse(
        readFileSync(post_cache_file, {
          encoding: 'utf-8'
        })
      )
      logger.success(`cache read, cached at ${post_cache.cached_at}`)
    } catch (e) {
      logger.error(`failed to read ${post_cache_file} or parse it as JSON`)
      throw e
    }
  } else {
    logger.warn(`${post_cache_file} missing, generating cache`)
    post_cache = await generate_cached_entry(
      post_from_all_post_cache.id,
      post_from_all_post_cache.notion_id,
      post_cache_file
    )
    return {
      post: {
        blocks: post_cache.blocks,
        id: event.params.id,
        slug: post_cache.slug,
        title: post_cache.title
      }
    }
  }

  logger.info(`checking freshness of ${post_cache_file}`)

  /* 1 means first date is after second date: https://date-fns.org/docs/compareAsc */
  if (
    compareAsc(
      parseISO(post_cache.cached_at),
      parseISO(post_from_all_post_cache.updated_at)
    ) !== 1
  ) {
    logger.warn(`${post_cache_file} is stale, generating fresh cache`)
    post_cache = await generate_cached_entry(
      post_from_all_post_cache.id,
      post_from_all_post_cache.notion_id,
      post_cache_file
    )
  } else {
    logger.success(`${post_cache_file} is fresh`)
  }

  return {
    post: {
      blocks: post_cache.blocks,
      id: event.params.id,
      slug: post_cache.slug,
      title: post_cache.title
    }
  }
}

async function generate_cached_entry(
  id: string,
  notion_id: string,
  file: string
): Promise<TNCache> {
  const blob_store = new HBlob('img')
  let blob_list: TNBlobList

  let post_blocks: TNRes<
    'block',
    {
      has_children: boolean
      object: 'block'
      parent: {
        page_id: string
        type: 'page_id'
      }
    } & (
      | TNBCode<'typescript'>
      | TNBHeading<1>
      | TNBHeading<2>
      | TNBHeading<3>
      | TNBImage
      | TNBParagraph
    )
  >

  let post_info: TNPage

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
        throw e
      }
    }
  }

  try {
    logger.info('fetching blocks from Notion')
    post_blocks = await notion.get(`/blocks/${notion_id}/children`).json()
    logger.success(`received ${post_blocks.results.length} blocks`)
  } catch (e) {
    logger.error('failed to fetch blocks')
    throw e
  }

  try {
    logger.info('fetching info from Notion')
    post_info = await notion.get(`/pages/${notion_id}`).json<TNPage>()
    logger.success('received info from Notion')
  } catch (e) {
    logger.error('failed to fetch post info')
    throw e
  }

  const blocks = (await Promise.all(
    post_blocks.results.map(async (block) => {
      logger.info(`processing block ${block.id} of type ${block.type}`)

      if ('code' in block) {
        return {
          id: block.id.slice(0, 8),
          language: block.code.language,
          notion_id: block.id,
          text: block.code.rich_text[0].plain_text,
          type: 'code'
        }
      }

      if ('heading_1' in block) {
        return {
          id: block.id.slice(0, 8),
          level: 1,
          notion_id: block.id,
          text: block.heading_1.rich_text[0].plain_text,
          type: 'heading'
        }
      }

      if ('heading_2' in block) {
        return {
          id: block.id.slice(0, 8),
          level: 2,
          notion_id: block.id,
          text: block.heading_2.rich_text[0].plain_text,
          type: 'heading'
        }
      }

      if ('heading_3' in block) {
        return {
          id: block.id.slice(0, 8),
          level: 2,
          notion_id: block.id,
          text: block.heading_3.rich_text[0].plain_text,
          type: 'heading'
        }
      }

      if ('image' in block) {
        const img_id = block.id.slice(0, 8)

        let img: ArrayBuffer
        let size: ISizeCalculationResult

        try {
          logger.info('fetching image')
          img = await wretch(block.image.file.url).get().arrayBuffer()
          logger.success(`fetched image of size ${img.byteLength} bytes`)
        } catch (e) {
          logger.error('failed to fetch image')
          throw e
        }

        try {
          logger.info(`uploading ${img_id} to blobs`)
          await blob_store.set(`${id}/${img_id}`, img)
          logger.success('image uploaded')
        } catch (e) {
          logger.error(`failed to upload ${img_id}`)
          throw e
        }

        try {
          logger.info('calculating image size')
          size = imageSize(new Uint8Array(img))
          if (!size.height || !size.width) {
            logger.error('height or width is invalid')
            throw new Error('height or width is invalid')
          }
        } catch (e) {
          logger.error('failed to calculate image size')
          throw e
        }

        return {
          alt: block.image.caption[0].plain_text,
          height: size.height,
          id: img_id,
          notion_id: block.id,
          type: 'image',
          width: size.width
        }
      }

      if ('paragraph' in block) {
        if (block.paragraph.rich_text.length) {
          return {
            id: block.id.slice(0, 8),
            notion_id: block.id,
            text: block.paragraph.rich_text[0].plain_text,
            type: 'paragraph'
          }
        } else {
          logger.warn(`skipping paragraph ${block.id} as it's empty`)
        }
      }
    })
  )) as Array<TNBlock>

  const title = post_info.properties.Title.title[0].plain_text

  const post_cache: TNCache = {
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
