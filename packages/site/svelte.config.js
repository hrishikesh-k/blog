import {adapterNetlifyEdgeFunctions} from '@hrishikeshk/sveltekit-adapter-netlify'
import {vitePreprocess} from '@sveltejs/vite-plugin-svelte'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapterNetlifyEdgeFunctions({}),
    alias: {
      '~/*': 'src/*'
    }
  },
  preprocess: vitePreprocess()
}

export default config