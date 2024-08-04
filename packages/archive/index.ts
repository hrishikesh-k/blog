import {cwd} from 'node:process'
import {HLogger} from '@hrishikeshk/utils'
import {join} from 'node:path'
import {rmSync} from 'node:fs'

const logger = new HLogger('@hrishikeshk/archive')
const working_dir = cwd()

const adapter_dist_dir = join(working_dir, '../adapter/dist')
const archive_dist_dir = join(working_dir, 'dist')
const cache_dist_dir = join(working_dir, '../cache/dist')
const image_dist_dir = join(working_dir, '../image/dist')
const site_build_dir = join(working_dir, '../site/build')
const site_netlify_cache_dir = join(working_dir, '../site/.netlify')
const site_netlify_cli_bug_dir = join(working_dir, '../site/packages')
const site_node_modules_dir = join(working_dir, '../site/node_modules')
const site_svelte_kit_cache_dir = join(working_dir, '../site/.svelte-kit')
const turbo_cache_dir = join(working_dir, '../../.turbo')
const utils_dist_dir = join(working_dir, '../utils/dist')

const dirs_to_delete = [
  adapter_dist_dir,
  archive_dist_dir,
  cache_dist_dir,
  image_dist_dir,
  site_build_dir,
  site_netlify_cache_dir,
  site_netlify_cli_bug_dir,
  site_node_modules_dir,
  site_svelte_kit_cache_dir,
  turbo_cache_dir,
  utils_dist_dir
]

dirs_to_delete.forEach((d) => {
  try {
    logger.info(`deleting ${d}`)
    rmSync(d, {
      force: true,
      recursive: true
    })
    logger.success(`successfully deleted ${d}`)
  } catch (e) {
    logger.error(`failed to delete ${d}`)
    throw e
  }
})
