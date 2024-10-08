import {cwd, env} from 'node:process'
import {join} from 'node:path'
import type {TNBlobList} from '~/lib/types.ts'
import wretch from 'wretch'
import wretchQueryStringAddon from 'wretch/addons/queryString'

export const cache_dir = join(cwd(), '.svelte-kit/cache')
export const all_posts_cache_file = join(cache_dir, 'all_posts.json')

export class HBlob {
  #api
  constructor(store_name: string) {
    this.#api = wretch(
      `https://api.netlify.com/api/v1/blobs/${env['NETLIFY_SITE_ID']}/${store_name}`
    )
      .addon(wretchQueryStringAddon)
      .auth(`Bearer ${env['NETLIFY_API_KEY']}`)
  }
  async get(key: string) {
    return await this.#api.get(`/${key}`).arrayBuffer()
  }
  async delete(key: string) {
    return await this.#api.delete(`/${key}`).res()
  }
  async list(prefix: string) {
    return await this.#api
      .query({
        prefix: `${prefix}/`
      })
      .get()
      .json<TNBlobList>()
  }
  async set(key: string, buffer: ArrayBuffer) {
    return await this.#api
      .headers({
        'content-type': 'application/octet-stream'
      })
      .put(buffer, `/${key}`)
      .res()
  }
}

export const notion = wretch('https://api.notion.com/v1')
  .auth(`Bearer ${env['NOTION_API_KEY']}`)
  .headers({
    'notion-version': '2022-06-28'
  })
