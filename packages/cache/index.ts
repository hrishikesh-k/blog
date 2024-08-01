import {argv, cwd, env, exit} from 'node:process'
// @ts-ignore
import {bindOpts} from '@netlify/cache-utils'
import {HLogger} from '@hrishikeshk/utils'
import {join} from 'node:path'

const action = argv[2].slice(2)
const logger = new HLogger('@hrishikeshk/cache')
const svelte_kit_cache_dir = join(cwd(), '../../site/.svelte-kit/cache')

if (![
  'restore',
  'save'
].includes(action)) {
  logger.error(`invalid action ${action}`)
  exit()
}

if (env['NETLIFY'] !== 'true') {
  logger.warn(`skipping ${action} as env['NETLIFY'] !== 'true'`)
  exit()
}

const action_status = await bindOpts({
  cacheDir: env['NETLIFY_CACHE_DIR'] || '/opt/build/cache'
})[action]([
  svelte_kit_cache_dir
])

if (action_status) {
  logger.success(`successfully ${action}d ${svelte_kit_cache_dir}`)
} else {
  logger.error(`failed to ${action} ${svelte_kit_cache_dir}`)
}

exit()