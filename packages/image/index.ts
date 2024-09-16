import { join } from 'node:path'
import { bundleEdgeFunction, rootDir } from '@hrishikeshk/utils'

const packageDir = join(rootDir, 'packages', 'site')
await bundleEdgeFunction(
  join(packageDir, 'deno', 'image.ts'),
  join(packageDir, '.netlify', 'edge-functions/image.js')
)
