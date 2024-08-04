import {
  all_posts_cache_file,
  cache_dir,
  notion
} from '~/lib/server/constants.ts'
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs'
import {HLogger} from '@hrishikeshk/utils'
import type {TNPage, TNRes} from '~/lib/types.ts'
import {slugify} from '~/lib/functions.ts'

export async function load_all_posts(logger: HLogger) {
  if (!existsSync(cache_dir)) {
    try {
      logger.info(`${cache_dir} missing, creating`)
      mkdirSync(cache_dir)
      logger.success(`${cache_dir} created`)
    } catch {
      logger.warn(
        `failed to create ${cache_dir}, build will proceed without cache`
      )
    }
  }

  logger.info('loading all posts')

  if (existsSync(all_posts_cache_file)) {
    // TODO: don't read this if old than a few minutes
    try {
      logger.info(`${all_posts_cache_file} exists, reading from cache`)
      const all_posts: Array<{
        id: string
        slug: string
        title: string
        updated_at: string
      }> = JSON.parse(
        readFileSync(all_posts_cache_file, {
          encoding: 'utf-8'
        })
      )
      logger.success(`read ${all_posts.length} posts from cache`)
      return all_posts
    } catch (e) {
      logger.error(`failed to read ${all_posts_cache_file} or parse it as JSON`)
      throw e
    }
  }

  let all_posts_from_notion: TNRes<
    'page_or_database',
    Pick<
      TNPage,
      | 'cover'
      | 'icon'
      | 'object'
      | 'parent'
      | 'properties'
      | 'public_url'
      | 'url'
    >
  >

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

  const all_posts_filtered = all_posts_from_notion.results
    .filter(
      (p) =>
        !p.archived &&
        !p.in_trash &&
        p.properties.Status.status.name === 'Published'
    )
    .map((p) => ({
      id: p.id,
      slug: slugify(p.properties.Title.title[0].plain_text),
      title: p.properties.Title.title[0].plain_text,
      updated_at: p.last_edited_time
    }))

  try {
    logger.info(
      `writing ${all_posts_filtered.length} filtered entries to ${all_posts_cache_file}`
    )
    writeFileSync(all_posts_cache_file, JSON.stringify(all_posts_filtered), {
      encoding: 'utf-8'
    })
    logger.success(`${all_posts_cache_file} wrote successfully`)
  } catch (e) {
    logger.error(
      `failed to write ${all_posts_cache_file} or encode data as JSON`
    )
    throw e
  }

  return all_posts_filtered
}