import {cwd, env} from 'node:process'
import {join} from 'node:path'
import type {TNBlobList} from '~/lib/types.ts'
import wretch from 'wretch'
import wretchQueryStringAddon from 'wretch/addons/queryString'

export const cacheDir = join(cwd(), '.svelte-kit/cache')
export const allPostsCacheFile = join(cacheDir, 'all_posts.json')

export class HBlob {
  #api
  constructor(storeName: string) {
    this.#api = wretch(
      `https://api.netlify.com/api/v1/blobs/${env.NETLIFY_SITE_ID}/${storeName}`
    )
      .addon(wretchQueryStringAddon)
      .auth(`Bearer ${env.NETLIFY_API_KEY}`)
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
  .auth(`Bearer ${env.NOTION_API_KEY}`)
  .headers({
    'notion-version': '2022-06-28'
  })
