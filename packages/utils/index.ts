import chalk from 'chalk'

export class HLogger {
  #prefix : string
  constructor(prefix? : string) {
    this.#prefix = `[${prefix}]` || '[logger]'
  }
  error(msg : string) {
    console.error(chalk.red(`${this.prefix}: ${msg}`))
  }
  get prefix() {
    return this.#prefix
  }
  info(msg : string) {
    console.info(chalk.blue(`${this.prefix}: ${msg}`))
  }
  set prefix(prefix : string) {
    this.#prefix = prefix
  }
  success(msg : string) {
    console.log(chalk.green(`${this.prefix}: ${msg}`))
  }
  warn(msg : string) {
    console.warn(`${this.prefix}: ${msg}`)
  }
}