import {bundle_edge_function} from '@hrishikeshk/utils'
import {cwd} from 'node:process'
import {join} from 'node:path'

const working_dir = cwd()
const package_dir = join(working_dir, '../site')
await bundle_edge_function(join(package_dir, 'deno/image.ts'), join(package_dir, '.netlify/edge-functions/image.js'))