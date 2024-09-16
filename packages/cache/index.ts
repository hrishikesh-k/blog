import { join } from 'node:path'
import { argv, env, exit } from 'node:process'
import { HLogger, rootDir } from '@hrishikeshk/utils'
import { bindOpts } from '@netlify/cache-utils'

const action = argv[2].slice(2)
const allowedActions = ['restore', 'save'] as const
const logger = new HLogger('@hrishikeshk/cache')
const svelteKitCacheDir = join(
  rootDir,
  'packages',
  'site',
  '.svelte-kit',
  'cache'
)

/* @ts-ignore: https://github.com/microsoft/TypeScript/issues/26255 */
if (!allowedActions.includes(action)) {
  logger.error(`invalid action ${action}`)
  exit()
}

if (env.NETLIFY !== 'true') {
  logger.warn(`skipping ${action} as env['NETLIFY'] !== 'true'`)
  exit()
}

const actionStatus = await bindOpts({
  cacheDir: '/opt/build/cache'
})[action as (typeof allowedActions)[number]]([svelteKitCacheDir], {})

if (actionStatus) {
  logger.success(`successfully ${action}d ${svelteKitCacheDir}`)
} else {
  logger.error(`failed to ${action} ${svelteKitCacheDir}`)
}

exit()
