import {bundleEdgeFunction} from '@hrishikeshk/utils'
import {cwd} from 'node:process'
import {join} from 'node:path'

const workingDir = cwd()
const packageDir = join(workingDir, '../site')
await bundleEdgeFunction(
  join(packageDir, 'deno/image.ts'),
  join(packageDir, '.netlify/edge-functions/image.js')
)
