import {
  allPostsCacheFile,
  cacheDir,
  HBlob,
  notion
} from '~/lib/server/constants.ts'
import {env} from 'node:process'
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs'
import {HLogger} from '@hrishikeshk/utils'
import {slugify} from '~/lib/functions.ts'
import type {TNPageInfo, TNRes} from '~/lib/types.ts'
import wretch from 'wretch'

export async function load_all_posts(logger: HLogger): Promise<{
  deploy_id: string
  posts: Array<{
    description: string
    featured: boolean
    id: string
    notion_id: string
    slug: string
    tags: Array<'Functions'>
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
      const all_post_cache: Awaited<ReturnType<typeof load_all_posts>> = JSON.parse(
        readFileSync(allPostsCacheFile, {
          encoding: 'utf-8'
        })
      )
      logger.success(`read ${all_post_cache.posts.length} posts from cache`)
      if (env['DEPLOY_ID'] === all_post_cache.deploy_id) {
        logger.success(
          'current deploy matches the cached data, re-using the cache'
        )
        return all_post_cache
      }
      logger.warn(
        'current deploy and cache does not match, re-fetching the data'
      )
    } catch (e) {
      logger.error(`failed to read ${allPostsCacheFile} or parse it as JSON`)
      throw e
    }
  }

  let all_posts_from_notion: TNRes<
    'page_or_database',
    TNPageInfo
  >

  /*
    fetch data from Notion and parse it as JSON, throw error if failed
  */
  try {
    logger.info('fetching entries')
    all_posts_from_notion = await notion
      .post(null, '/databases/ee93ad0cead84102868aae5665d8d2d1/query')
      .json()
    logger.success(
      `fetched ${all_posts_from_notion.results.length} total entries`
    )
  } catch (e) {
    logger.error('failed to fetch entries')
    throw e
  }

  const all_posts_filtered = {
    deploy_id: env['DEPLOY_ID']!,
    posts: await Promise.all(all_posts_from_notion.results
      .filter(
        (p) =>
          !p.archived &&
          !p.in_trash &&
          p.properties.Status.status.name === 'Published'
      ).map(async p => {
        const id = p.id.slice(0, 8)
  
        let cover_img: ArrayBuffer
        let cover_size: ISizeCalculationResult
  
        try {
          logger.info('downloading post cover')
          cover_img = await wretch(p.cover!.file.url).get().arrayBuffer()
          logger.success(`fetched image of size ${cover_img.byteLength} bytes`)
        } catch (e) {
          logger.error('failed to fetch cover')
          throw e
        }
  
        const blob_store = new HBlob('img')
  
        try {
          logger.info('uploading cover to blobs')
          await blob_store.set(`${id}/${id}`, cover_img)
          logger.success('cover uploaded')
        } catch (e) {
          logger.error('failed to upload cover')
          throw e
        }
  
        try {
          logger.info('calculating image size')
          cover_size = imageSize(new Uint8Array(cover_img))
          if (!cover_size.height || !cover_size.width) {
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
        
      }))
  }

  try {
    logger.info(
      `writing ${all_posts_filtered.posts.length} filtered entries to ${allPostsCacheFile}`
    )
    writeFileSync(allPostsCacheFile, JSON.stringify(all_posts_filtered), {
      encoding: 'utf-8'
    })
    logger.success(`${allPostsCacheFile} wrote successfully`)
  } catch (e) {
    logger.error(
      `failed to write ${allPostsCacheFile} or encode data as JSON`
    )
    throw e
  }

  return all_posts_filtered

}

export async function load_image_and_compute_size() {

}