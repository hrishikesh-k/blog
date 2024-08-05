<script lang="ts">
  import {createHighlighterCore, loadWasm} from 'shiki/core'
  import {onMount} from 'svelte'
  export let code : string
  export let lang : 'typescript'
  let code_output = '<pre></pre>'
  onMount(async () => {
    await loadWasm(import('shiki/wasm'))
    const highlighter = await createHighlighterCore({
      langs: [
        import('shiki/langs/typescript.mjs')
      ],
      themes: [
        import('shiki/themes/github-dark-default.mjs'),
        import('shiki/themes/github-light-default.mjs')
      ]
    })
    code_output = highlighter.codeToHtml(code, {
      lang,
      theme: 'github-dark-default'
    })
  })
</script>
<div>{@html code_output}</div>
