import type {Config} from '@netlify/edge-functions'
import {HBlob} from '~/lib/server/constants.ts'

export default async function (req: Request) {
  const url = new URL(req.url)
  const segments = url.pathname.split('/')
  const blobs = new HBlob('img')
  const image = await blobs.get(`${segments[2]}/${segments[3]}`)
  return new Response(image, {
    headers: {
      'cache-control': 'immutable, public, max-age=31536000',
      'content-type': image.type
    }
  })
}

export const config: Config = {
  cache: 'manual',
  pattern:
    '^\\/images(\\/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}){2}$'
}
