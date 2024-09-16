import { spawn } from 'node:child_process'
import { join } from 'node:path'
import {exit} from 'node:process'
import { rootDir } from '@hrishikeshk/utils'

const biome = spawn(join(rootDir, 'node_modules', '.bin', 'biome'), ['lint', '--error-on-warnings'], {
  cwd: rootDir,
  stdio: 'inherit'
})

biome.on('close', (code) => {
  exit(code)
})