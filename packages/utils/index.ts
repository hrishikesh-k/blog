import {build} from 'esbuild'
import {builtinModules} from 'node:module'
import chalk from 'chalk'

export async function bundleEdgeFunction(input: string, output: string) {
  await build({
    alias: Object.fromEntries(builtinModules.map((id) => [id, `node:${id}`])),
    bundle: true,
    entryPoints: [input],
    external: builtinModules.map((id) => `node:${id}`),
    format: 'esm',
    mainFields: ['module', 'main'],
    outfile: output,
    platform: 'neutral',
    target: 'esnext'
  })
}

export class HLogger {
  #prefix: string
  constructor(prefix?: string) {
    this.#prefix = `[${prefix}]` || '[logger]'
  }
  error(msg: string) {
    console.error(chalk.red(`${this.prefix}: ${msg}`))
  }
  get prefix() {
    return this.#prefix
  }
  info(msg: string) {
    console.info(chalk.blue(`${this.prefix}: ${msg}`))
  }
  set prefix(prefix: string) {
    this.#prefix = prefix
  }
  success(msg: string) {
    console.info(chalk.green(`${this.prefix}: ${msg}`))
  }
  warn(msg: string) {
    console.warn(chalk.yellow(`${this.prefix}: ${msg}`))
  }
}
