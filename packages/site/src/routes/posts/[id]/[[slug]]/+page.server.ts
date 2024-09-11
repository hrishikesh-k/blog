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
  const allPostsCache = await load_all_posts(logger)

  return allPostsCache.posts
    .map((p) => ({
      id: p.id
    }))
    .concat(
      allPostsCache.posts.map((p) => ({
        id: p.id,
        slug: p.slug
      }))
    )
}

export const load: PageServerLoad = async (event) => {
  logger.prefix = `/${Object.values(event.params).join('/')}/`

  const postCacheFile = join(cache_dir, `${event.params.id}.json`)

  let postCache: TNCache

  const allPostsCache = await load_all_posts(logger)

  logger.info(`looking up ${event.params.id} in ${all_posts_cache_file}`)
  const postFromAllPostCache = allPostsCache.posts.find(
    (p) => p.id === event.params.id
  )

  if (!postFromAllPostCache) {
    logger.error(
      `${event.params.id} missing in ${all_posts_cache_file}, this is unexpected`
    )
    throw new Error(`${event.params.id} missing`)
  }

  logger.success(`found ${event.params.id} in ${all_posts_cache_file}`)

  if (existsSync(postCacheFile)) {
    try {
      logger.info(`cache found at ${postCacheFile}, reading it`)
      postCache = JSON.parse(
        readFileSync(postCacheFile, {
          encoding: 'utf-8'
        })
      )
      logger.success(`cache read, cached at ${postCache.cached_at}`)
    } catch (e) {
      logger.error(`failed to read ${postCacheFile} or parse it as JSON`)
      throw e
    }
  } else {
    logger.warn(`${postCacheFile} missing, generating cache`)
    postCache = await generateCachedEntry(
      postFromAllPostCache.id,
      postFromAllPostCache.notion_id,
      postCacheFile
    )
    return {
      post: {
        blocks: postCache.blocks,
        id: event.params.id,
        slug: postCache.slug,
        title: postCache.title
      }
    }
  }

  logger.info(`checking freshness of ${postCacheFile}`)

  /* 1 means first date is after second date: https://date-fns.org/docs/compareAsc */
  if (
    compareAsc(
      parseISO(postCache.cached_at),
      parseISO(postFromAllPostCache.updated_at)
    ) !== 1
  ) {
    logger.warn(`${postCacheFile} is stale, generating fresh cache`)
    postCache = await generateCachedEntry(
      postFromAllPostCache.id,
      postFromAllPostCache.notion_id,
      postCacheFile
    )
  } else {
    logger.success(`${postCacheFile} is fresh`)
  }

  return {
    post: {
      blocks: postCache.blocks,
      id: event.params.id,
      slug: postCache.slug,
      title: postCache.title
    }
  }
}

async function generateCachedEntry(
  id: string,
  notionId: string,
  file: string
): Promise<TNCache> {
  const blobStore = new HBlob('img')
  let blobList: TNBlobList

  let postBlocks: TNRes<
    'block',
    {
      // biome-ignore lint/style/useNamingConvention: Notion's convention
      has_children: boolean
      object: 'block'
      parent: {
        // biome-ignore lint/style/useNamingConvention: Notion's convention
        page_id: string
        type: 'page_id'
      }
    } & (
      TNBCode<'typescript'>
      | TNBHeading<1>
      | TNBHeading<2>
      | TNBHeading<3>
      | TNBImage
      | TNBParagraph
    )
  >

  let postInfo: TNPage

  try {
    logger.info('checking existing blobs for current page')
    blobList = await blobStore.list(id)
    // TODO: check updated time
    blobList.blobs = blobList.blobs.filter(b => !b.key.endsWith(id))
    logger.success(`found ${blobList.blobs.length} blobs`)
  } catch (e) {
    logger.error('failed to fetch blobs list')
    throw e
  }

  if (blobList.blobs.length) {
    for (const blob of blobList.blobs) {
      try {
        logger.warn(`deleting blobs ${blob.key} as it's likely stale`)
        await blobStore.delete(blob.key)
        logger.success(`deleted ${blob.key}`)
      } catch (e) {
        logger.error(`failed to delete blob ${blob.key}`)
        throw e
      }
    }
  }

  try {
    logger.info('fetching blocks from Notion')
    postBlocks = await notion.get(`/blocks/${notionId}/children`).json()
    logger.success(`received ${postBlocks.results.length} blocks`)
  } catch (e) {
    logger.error('failed to fetch blocks')
    throw e
  }

  try {
    logger.info('fetching info from Notion')
    postInfo = await notion.get(`/pages/${notionId}`).json<TNPage>()
    logger.success('received info from Notion')
  } catch (e) {
    logger.error('failed to fetch post info')
    throw e
  }

  let cover: TNCache['cover']

  if (postInfo.cover) {
    let coverImg: ArrayBuffer
    let coverSize: ISizeCalculationResult

    try {
      logger.info('downloading post cover')
      coverImg = await wretch(postInfo.cover.file.url).get().arrayBuffer()
      logger.success(`fetched image of size ${coverImg.byteLength} bytes`)
    } catch (e) {
      logger.error('failed to fetch cover')
      throw e
    }

    try {
      logger.info('uploading cover to blobs')
      await blobStore.set(`${id}/${id}`, coverImg)
      logger.success('cover uploaded')
    } catch (e) {
      logger.error('failed to upload cover')
      throw e
    }

    try {
      logger.info('calculating cover size')
      coverSize = imageSize(new Uint8Array(coverImg))
      if (!(coverSize.height && coverSize.width)) {
        logger.error('height or width is invalid')
        throw new Error('height or width is invalid')
      }
    } catch (e) {
      logger.error('failed to calculate cover size')
      throw e
    }

    cover = {
      height: coverSize.height,
      width: coverSize.width
    }
  }

  const blocks = (await Promise.all(
    postBlocks.results.map(async (block) => {
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
        const imgId = block.id.slice(0, 8)

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
          logger.info(`uploading ${imgId} to blobs`)
          await blobStore.set(`${id}/${imgId}`, img)
          logger.success('image uploaded')
        } catch (e) {
          logger.error(`failed to upload ${imgId}`)
          throw e
        }

        try {
          logger.info('calculating image size')
          size = imageSize(new Uint8Array(img))
          if (!(size.height && size.width)) {
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
          id: imgId,
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
        }
        logger.warn(`skipping paragraph ${block.id} as it's empty`)
      }
    })
  )) as TNBlock[]

  const title = postInfo.properties.Title.title[0].plain_text

  const postCache: TNCache = {
    blocks: blocks.filter(Boolean),
    cover,
    cached_at: formatISO(Date.now()),
    id,
    slug: slugify(title),
    title
  }

  try {
    logger.info(`writing cache to ${file}`)
    writeFileSync(file, JSON.stringify(postCache), {
      encoding: 'utf-8'
    })
    logger.success(`successfully wrote ${file}`)
  } catch (e) {
    logger.error(`failed to write ${file} or stringify data as JSON`)
    throw e
  }

  return postCache
}