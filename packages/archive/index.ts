import {cwd} from 'node:process'
import {HLogger} from '@hrishikeshk/utils'
import {join} from 'node:path'
import {rmSync} from 'node:fs'

const logger = new HLogger('@hrishikeshk/archive')
const workingDir = cwd()

const adapterDistDir = join(workingDir, '../adapter/dist')
const archiveDistDir = join(workingDir, 'dist')
const cacheDistDir = join(workingDir, '../cache/dist')
const imageDistDir = join(workingDir, '../image/dist')
const siteBuildDir = join(workingDir, '../site/build')
const siteNetlifyCacheDir = join(workingDir, '../site/.netlify')
const siteNetlifyCliBugDir = join(workingDir, '../site/packages')
const siteNodeModulesDir = join(workingDir, '../site/node_modules')
const siteSvelteKitCacheDir = join(workingDir, '../site/.svelte-kit')
const turboCacheDir = join(workingDir, '../../.turbo')
const utilsDistDir = join(workingDir, '../utils/dist')

const dirsToDelete = [
  adapterDistDir,
  archiveDistDir,
  cacheDistDir,
  imageDistDir,
  siteBuildDir,
  siteNetlifyCacheDir,
  siteNetlifyCliBugDir,
  siteNodeModulesDir,
  siteSvelteKitCacheDir,
  turboCacheDir,
  utilsDistDir
]

for (const d of dirsToDelete) {
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
}