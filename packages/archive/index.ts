import { rmSync } from 'node:fs'
import { join } from 'node:path'
import { cwd } from 'node:process'
import { HLogger, rootDir } from '@hrishikeshk/utils'

const logger = new HLogger('@hrishikeshk/archive')
const workingDir = cwd()

const adapterDistDir = join(rootDir, 'adapter', 'dist')
const archiveDistDir = join(workingDir, 'dist')
const cacheDistDir = join(rootDir, 'cache', 'dist')
const imageDistDir = join(rootDir, 'image', 'dist')
const siteBuildDir = join(rootDir, 'site', 'build')
const siteNetlifyCacheDir = join(rootDir, 'site', '.netlify')
const siteNetlifyCliBugDir = join(rootDir, 'site', 'packages')
const siteNodeModulesDir = join(rootDir, 'site', 'node_modules')
const siteSvelteKitCacheDir = join(rootDir, 'site', '.svelte-kit')
const turboCacheDir = join(rootDir, '.turbo')
const utilsDistDir = join(rootDir, 'utils', 'dist')

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
