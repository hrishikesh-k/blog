import {argv, cwd, env, exit} from 'node:process'
import {bindOpts} from '@netlify/cache-utils'
import {HLogger} from '@hrishikeshk/utils'
import {join} from 'node:path'

const action = argv[2].slice(2)
const allowed_actions = ['restore', 'save'] as const
const logger = new HLogger('@hrishikeshk/cache')
const svelte_kit_cache_dir = join(cwd(), '../site/.svelte-kit/cache')

/* @ts-ignore: https://github.com/microsoft/TypeScript/issues/26255 */
if (!allowed_actions.includes(action)) {
  logger.error(`invalid action ${action}`)
  exit()
}

if (env['NETLIFY'] !== 'true') {
  logger.warn(`skipping ${action} as env['NETLIFY'] !== 'true'`)
  exit()
}

const action_status = await bindOpts({
  cacheDir: '/opt/build/cache'
})[action as typeof allowed_actions[number]]([svelte_kit_cache_dir], {})

if (action_status) {
  logger.success(`successfully ${action}d ${svelte_kit_cache_dir}`)
} else {
  logger.error(`failed to ${action} ${svelte_kit_cache_dir}`)
}

exit()
