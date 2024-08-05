import {HLogger} from '@hrishikeshk/utils'
import {load_all_posts} from '~/lib/server/functions.ts'
import type {PageServerLoad} from './$types'

export const load: PageServerLoad = async () => {
  const logger = new HLogger('/posts/+page.server.ts')
  const all_posts_cache = await load_all_posts(logger)
  return {
    posts: all_posts_cache.posts
  }
}
