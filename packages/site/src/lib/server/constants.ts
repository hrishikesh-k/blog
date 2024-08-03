import {env} from 'node:process'
import type {TNBlobList} from '~/lib/types.ts'
import wretch from 'wretch'
import wretchQueryStringAddon from 'wretch/addons/queryString'

export class HBlob {
  #api
  constructor(store_name : string) {
    this.#api = wretch(`https://api.netlify.com/api/v1/blobs/${env['NETLIFY_SITE_ID']}/${store_name}`).addon(wretchQueryStringAddon).auth(`Bearer ${env['NETLIFY_API_KEY']}`)
  }
  async get(key : string) {
    return await this.#api.get(`/${key}`).blob()
  }
  async delete(key : string) {
    return await this.#api.delete(`/${key}`).res()
  }
  async list(prefix : string) {
    return await this.#api.query({
      prefix: `${prefix}/`
    }).get().json<TNBlobList>()
  }
  async set(key : string, blob : Blob) {
    return await this.#api.headers({
      'content-type': 'application/octet-stream'
    }).put(blob, `/${key}`).res()
  }
}

export const notion = wretch('https://api.notion.com/v1').auth(`Bearer ${env['NOTION_API_KEY']}`).headers({
  'notion-version': '2022-06-28'
})