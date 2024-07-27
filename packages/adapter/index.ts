import type {Adapter, Builder} from '@sveltejs/kit'
import {build} from 'esbuild'
import {builtinModules} from 'node:module'
import type {Config as EdgeFunctionsConfig} from '@netlify/edge-functions'
import type {Config as FunctionsConfig} from '@netlify/functions'
import {cwd} from 'node:process'
import {join, relative} from 'node:path'
import {writeFileSync} from 'node:fs'

const fn_name = 'SvelteKit Server'
const generator = '@hrishikeshk/sveltekit-adapter-netlify@0.0.1'
const working_dir = cwd()
const ntl_frameworks_api_dir = join(working_dir, '.netlify/v1')
const sk_server_dir = join(working_dir, '.svelte-kit/netlify')

async function init(builder : Builder) {
  const publish_dir = join(working_dir, 'build')
  builder.log.info(`cwd: ${working_dir}`)
  builder.log.info(`publish: ${publish_dir}`)
  const sk_publish_dir = join(publish_dir, builder.config.kit.paths.base)
  /*
    delete the folders this adapter writes to
    publish_dir will contain all static files
    ntl_frameworks_api_dir will contain Config as well as the Lambda Function
    sk_server_dir will contain the server files generated by SvelteKit's builder.writeServer()
   */
  const delete_dirs = [
    publish_dir,
    ntl_frameworks_api_dir,
    sk_server_dir
  ]
  builder.log.warn(`deleting: ${delete_dirs.map(d => `\n  - ${d}`).join()}`)
  try {
    delete_dirs.forEach(d => builder.rimraf(d))
    builder.log.success('successfully deleted')
  } catch (e) {
    builder.log.error('failed to delete')
    throw e
  }
  /*
    create directories before writing data to prevent any failure
    we create the most-nested directory so parent dirs are automatically created
    ntl_frameworks_api_dir is required to write the config,
    (Edge) Functions will create their directory when needed
    sk_publish_dir will auto-create publish_dir
   */
  builder.mkdirp(ntl_frameworks_api_dir)
  builder.mkdirp(sk_publish_dir)
  /* write common files, adapter-specific files will be written later */
  builder.log.info(`writing client assets to ${sk_publish_dir}`)
  builder.log.info(`writing prerendered files to ${sk_publish_dir}`)
  builder.log.info(`writing server assets to ${sk_server_dir}`)
  builder.log.info(`writing Netlify config to ${ntl_frameworks_api_dir}`)
  try {
    builder.writeClient(sk_publish_dir)
    builder.writePrerendered(sk_publish_dir)
    builder.writeServer(sk_server_dir)
    writeFileSync(join(ntl_frameworks_api_dir, 'config.json'), JSON.stringify({
      headers: [{
        for: `/${builder.getAppPath()}/immutable/*`,
        values: {
          'cache-control': 'immutable, public, max-age=31536000'
        }
      }]
    }))
    builder.log.success('successfully wrote static and config files')
  } catch (e) {
    builder.log.error('failed to write files')
    throw e
  }
}

export function adapterNetlifyEdgeFunctions(options : Partial<Pick<EdgeFunctionsConfig, 'excludedPath' | 'onError' | 'rateLimit'>> = {}) {
  return {
    async adapt(builder) {
      builder.log.info('adapter is using Netlify Edge Functions')
      await init(builder)
      const ntl_edge_functions_dir = join(ntl_frameworks_api_dir, 'edge-functions')
      function path_to_regex(path : string, suffix? : string) {
        return [
          '^',
          path.split('').map(s => {
            if (/[A-Za-z]/.test(s)) {
              return `[${s.toUpperCase()}${s.toLowerCase()}]`
            }
            switch (s) {
              case '/':
                return '\\/'
              case '.':
                return '\\.'
              case '*':
                return '.*'
              default:
                return s
            }
          }).join(''),
          suffix,
          '$'
        ].join('')
      }
      const efn = `import {Server} from '${join(builder.getServerDirectory(), 'index.js')}'
const server = new Server(${builder.generateManifest({
  relativePath: './'
})})
await server.init({
  env: Deno.env.toObject()
})
export default async function(req, context) {
  return server.respond(req, {
    getClientAddress() {
      return context.ip
    },
    platform: {
      context
    }
  })
}
export const config = {
  excludedPattern: ${JSON.stringify([
    `${path_to_regex('/.netlify/*')}`,
    `${path_to_regex('/favicon.ico')}`,
    `${path_to_regex(`/${builder.getAppPath()}/immutable/*`)}`
  ].concat(builder.routes.filter(r => r.prerender).map(r => {
    if (r.id === '/') {
      /* https://regex101.com/r/5Pk7mO/1 */
      return path_to_regex('/', '(([Hh][Oo][Mm][Ee]|[Ii][Nn][Dd][Ee][Xx])\\.[Hh][Tt][Mm][Ll]?)?')
    }
    /* https://regex101.com/r/eE3kiI/1 */
    return path_to_regex(r.id, '(\\.[Hh][Tt][Mm][Ll]?|\\/|(\\/([Ii][Nn][Dd][Ee][Xx]|[Hh][Oo][Mm][Ee]))\\.[Hh][Tt][Mm][Ll]?)?')
  }).flat()).concat(options.excludedPath || []))},
  generator: '${generator}',
  name: '${fn_name}',
  onError: ${JSON.stringify(options.onError || undefined)},
  pattern: ${JSON.stringify(path_to_regex('/*'))},
  rateLimit: ${JSON.stringify(options.rateLimit || undefined)}
}`
      /*
        write the Edge Function into SvelteKit's server dir,
        that will be processed by esbuild and written to Netlify's output dir
       */
      const ntl_ef_path = join(sk_server_dir, 'sk-server.js')
      builder.log.info(`writing Edge Function to ${sk_server_dir}`)
      try {
        builder.mkdirp(ntl_edge_functions_dir)
        writeFileSync(ntl_ef_path, efn)
        builder.log.success('successfully wrote Edge Function')
      } catch (e) {
        builder.log.error('failed to write Edge Function')
        throw e
      }
      builder.log.info('Bundling Edge Function using esbuild')
      try {
        await build({
          alias: Object.fromEntries(builtinModules.map(id => [
            id,
            `node:${id}`
          ])),
          bundle: true,
          entryPoints: [
            ntl_ef_path
          ],
          external: builtinModules.map(id => `node:${id}`),
          format: 'esm',
          mainFields: [
            'module',
            'main'
          ],
          outfile: join(ntl_edge_functions_dir, 'sk-server.js'),
          platform: 'neutral',
          target: 'esnext'
        })
        builder.log.success('successfully bundled Edge Function')
      } catch (e) {
        builder.log.error('failed to bundle Edge Function')
        throw e
      }
    },
    name: generator,
    supports: {
      read(config) {
        throw new Error(`${generator} cannot use \`read\` from \`$apps/server\' in route \`${config.route.id}\`, switch to \`adapterNetlifyFunctions\``)
      }
    }
  } satisfies Adapter
}

export function adapterNetlifyFunctions(options : Partial<Pick<FunctionsConfig, 'excludedPath' | 'rateLimit'>> = {}) {
  return {
    async adapt(builder) {
      builder.log.info('adapter is using Netlify Functions')
      await init(builder)
      const ntl_functions_dir = join(ntl_frameworks_api_dir, 'functions')
      const fn = `import {env} from 'node:process'
import {Server} from '${join(builder.getServerDirectory(), 'index.js')}'
import {webcrypto} from 'node:crypto'
if (!globalThis.crypto) {
  Object.defineProperty(globalThis, 'crypto', {
    configurable: true,
    enumerable: true,
    value: webcrypto,
    writable: true
  })
}
const server = new Server(${builder.generateManifest({
  relativePath: relative(ntl_functions_dir, sk_server_dir)
})})
await server.init({
  env
})
export default async function(req, context) {
  return server.respond(req, {
    getClientAddress() {
      return context.ip
    },
    platform: {
      context
    }
  })
}
export const config = {
  displayName: '${fn_name}',
  excludedPath: ${JSON.stringify([
    '/.netlify/*'
  ].concat(options.excludedPath || []))},
  generator: '${generator}',
  path: '/*',
  preferStatic: true,
  rateLimit: ${JSON.stringify(options.rateLimit || undefined)}
}`
      builder.log.info(`writing Function to ${ntl_functions_dir}`)
      try {
        builder.mkdirp(ntl_functions_dir)
        writeFileSync(join(ntl_functions_dir, 'sk-server.js'), fn)
        builder.log.success('successfully wrote Function')
      } catch (e) {
        builder.log.error('failed to write Function')
        throw e
      }
    },
    name: generator
  } satisfies Adapter
}

export function adapterNetlifyStatic() {
  return {
    async adapt(builder) {
      const dynamic_routes = builder.routes.filter(r => !r.prerender)
      if (dynamic_routes.length) {
        builder.log.error(`${generator} found the following dynamic routes:${dynamic_routes.map(r => '\n  - ' + join(relative(working_dir, builder.config.kit.files.routes), r.id))}`)
        throw new Error('')
      }
      builder.generateEnvModule()
      await init(builder)
    },
    name: generator
  } satisfies Adapter
}