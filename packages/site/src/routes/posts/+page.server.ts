import { HLogger } from '@hrishikeshk/utils'
import { loadAllPosts } from '~/lib/server/functions.ts'
import type { PageServerLoad } from './$types.ts'

export const load: PageServerLoad = async () => {
  const logger = new HLogger('/posts/+page.server.ts')
  const allPostsCache = await loadAllPosts(logger)
  return {
    posts: allPostsCache.posts
  }
}
