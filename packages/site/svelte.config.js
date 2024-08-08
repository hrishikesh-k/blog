import {adapterNetlifyStatic} from '@hrishikeshk/adapter'
import {vitePreprocess} from '@sveltejs/vite-plugin-svelte'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapterNetlifyStatic({}),
    alias: {
      '~/*': './src/*'
    },
    prerender: {
      handleHttpError(details) {
        if (
          details.path.startsWith('/.netlify/images') ||
          details.path.startsWith('/tags/')
        ) {
          return
        }
        throw new Error(details.message)
      }
    }
  },
  preprocess: vitePreprocess()
}

export default config
