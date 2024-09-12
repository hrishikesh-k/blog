<script lang="ts">
import { createHighlighterCore, loadWasm } from 'shiki/core'
import { onMount } from 'svelte'
export let code: string
export let lang: 'typescript'

let codeOutput = '<pre></pre>'

onMount(async () => {
  await loadWasm(import('shiki/wasm'))
  const highlighter = await createHighlighterCore({
    langs: [import('shiki/langs/typescript.mjs')],
    themes: [
      import('shiki/themes/github-dark-default.mjs'),
      import('shiki/themes/github-light-default.mjs')
    ]
  })
  codeOutput = highlighter.codeToHtml(code, {
    lang,
    theme: 'github-dark-default'
  })
})
</script>
<div>{@html codeOutput}</div>
