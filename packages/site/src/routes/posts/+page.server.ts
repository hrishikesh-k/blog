import { HLogger } from '@hrishikeshk/utils'
import { load_all_posts } from '~/lib/server/functions.ts'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
  const logger = new HLogger('/posts/+page.server.ts')
  const allPostsCache = await load_all_posts(logger)
  return {
    posts: allPostsCache.posts
  }
}
