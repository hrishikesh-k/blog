import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { env } from 'node:process'
import type { HLogger } from '@hrishikeshk/utils'
import MImageSize from 'image-size'
import type { ISizeCalculationResult } from 'image-size/dist/types/interface.d.ts'
import MWretch from 'wretch'
import { slugify } from '~/lib/functions.ts'
import {
  HBlob,
  allPostsCacheFile,
  cacheDir,
  notion
} from '~/lib/server/constants.ts'
import type { TNPageInfo, TNRes } from '~/lib/types.ts'

export async function loadAllPosts(logger: HLogger): Promise<{
  deploy_id: string
  posts: Array<{
    description: string
    featured: boolean
    id: string
    notion_id: string
    slug: string
    tags: 'Functions'[]
    title: string
    updated_at: string
  }>
}> {
  /*
    if cacheDir doesn't exist:
      - attempt to create it
        - if that fails, log warning and continue

    cacheDir won't exist in the following conditions:
      - (local) .svelte-kit/.cache (or parent) was deleted
      - (Netlify) build triggered without cache
      - (Netlify) build failed to restore cache
      - (Netlify) previous build failed to store cache
  */
  if (!existsSync(cacheDir)) {
    try {
      logger.info(`${cacheDir} missing, creating`)
      mkdirSync(cacheDir)
      logger.success(`${cacheDir} created`)
    } catch {
      logger.warn(
        `failed to create ${cacheDir}, build will proceed without cache`
      )
    }
  }

  logger.info('loading all posts')

  /*
    if allPostsCacheFile exists:
      - attempt to read and parse it as JSON
        - if it succeeds compare the deploy ID in cache file and environment
          this comparision helps us avoid re-fething the data even if this function is called multiple times
          at the same time, it allows us to force fetch data when the deploy ID changes
          - if the deploy ID matches, return the data
          - else, log warning and continue
        - if it fails, throw the error
  */
  if (existsSync(allPostsCacheFile)) {
    try {
      logger.info(`${allPostsCacheFile} exists, reading from cache`)
      const allPostCache: Awaited<ReturnType<typeof loadAllPosts>> = JSON.parse(
        readFileSync(allPostsCacheFile, {
          encoding: 'utf-8'
        })
      )
      logger.success(`read ${allPostCache.posts.length} posts from cache`)
      if (env.DEPLOY_ID === allPostCache.deploy_id) {
        logger.success(
          'current deploy matches the cached data, re-using the cache'
        )
        return allPostCache
      }
      logger.warn(
        'current deploy and cache does not match, re-fetching the data'
      )
    } catch (e) {
      logger.error(`failed to read ${allPostsCacheFile} or parse it as JSON`)
      throw e
    }
  }

  let allPostsFromNotion: TNRes<'page_or_database', TNPageInfo>

  /*
    fetch data from Notion and parse it as JSON, throw error if failed
  */
  try {
    logger.info('fetching entries')
    allPostsFromNotion = await notion
      .post(null, '/databases/ee93ad0cead84102868aae5665d8d2d1/query')
      .json()
    logger.success(`fetched ${allPostsFromNotion.results.length} total entries`)
  } catch (e) {
    logger.error('failed to fetch entries')
    throw e
  }

  const allPostsFiltered = {
    deploy_id: env.DEPLOY_ID,
    posts: await Promise.all(
      allPostsFromNotion.results
        .filter(
          (p) =>
            !(p.archived || p.in_trash) &&
            p.properties.Status.status.name === 'Published'
        )
        .map(async (p) => {
          const id = p.id.slice(0, 8)

          let coverImg: ArrayBuffer
          let coverSize: ISizeCalculationResult

          try {
            logger.info('downloading post cover')
            // TODO: cover
            coverImg = await MWretch(p.cover?.file.url).get().arrayBuffer()
            logger.success(`fetched image of size ${coverImg.byteLength} bytes`)
          } catch (e) {
            logger.error('failed to fetch cover')
            throw e
          }

          const blobStore = new HBlob('img')

          try {
            logger.info('uploading cover to blobs')
            await blobStore.set(`${id}/${id}`, coverImg)
            logger.success('cover uploaded')
          } catch (e) {
            logger.error('failed to upload cover')
            throw e
          }

          try {
            logger.info('calculating image size')
            coverSize = MImageSize(new Uint8Array(coverImg))
            if (!(coverSize.height && coverSize.width)) {
              logger.error('height or width is invalid')
              throw new Error('height or width is invalid')
            }
          } catch (e) {
            logger.error('failed to calculate image size')
            throw e
          }

          return {
            description: p.properties.Description.rich_text[0].plain_text,
            featured: p.properties.Featured.checkbox,
            id,
            notion_id: p.id,
            slug: slugify(p.properties.Title.title[0].plain_text),
            tags: p.properties.Tags.multi_select.map((t) => t.name),
            title: p.properties.Title.title[0].plain_text,
            updated_at: p.last_edited_time
          }
        })
    )
  }

  try {
    logger.info(
      `writing ${allPostsFiltered.posts.length} filtered entries to ${allPostsCacheFile}`
    )
    writeFileSync(allPostsCacheFile, JSON.stringify(allPostsFiltered), {
      encoding: 'utf-8'
    })
    logger.success(`${allPostsCacheFile} wrote successfully`)
  } catch (e) {
    logger.error(`failed to write ${allPostsCacheFile} or encode data as JSON`)
    throw e
  }

  return allPostsFiltered
}
