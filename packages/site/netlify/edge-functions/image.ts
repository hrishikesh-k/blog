import type {Config, Context} from '@netlify/edge-functions'
import wretch from 'https://esm.sh/wretch@2.9.0'

export default async function (req : Request, context : Context) {
  const url = new URL(req.url)
  const segments = url.pathname.split('/')
  const image = await wretch(`https://api.netlify.com/api/v1/blobs/${context.site.id}/images/${segments[2]}/${segments[3]}`).auth(`Bearer ${Netlify.env.get('NETLIFY_API_KEY')}`).get().blob()
  return new Response(image, {
    headers: {
      'cache-control': 'immutable, public, max-age=31536000',
      'content-type': image.type
    }
  })
}

export const config : Config = {
  cache: 'manual',
  pattern: '^\\/images(\\/[0-9a-fA-F]{8}\\-[0-9a-fA-F]{4}\\-[0-9a-fA-F]{4}\\-[0-9a-fA-F]{4}\\-[0-9a-fA-F]{12}){2}$'
}