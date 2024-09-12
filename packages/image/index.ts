import { join } from 'node:path'
import { cwd } from 'node:process'
import { bundleEdgeFunction } from '@hrishikeshk/utils'

const workingDir = cwd()
const packageDir = join(workingDir, '../site')
await bundleEdgeFunction(
  join(packageDir, 'deno/image.ts'),
  join(packageDir, '.netlify/edge-functions/image.js')
)
