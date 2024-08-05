<script lang="ts">
  import {createHighlighterCore} from 'shiki/core'
  import {onMount} from 'svelte'
  import shikiLangTypescript from 'shiki/langs/typescript.mjs'
  import shikiThemeGitHubDarkDefault from 'shiki/themes/github-dark-default.mjs'
  import shikiWasm from 'shiki/wasm'
  export let code : string
  export let lang = 'typescript'
  let code_output = '<pre></pre>'
  onMount(async () => {
    const highlighter = await createHighlighterCore({
      langs: [
        shikiLangTypescript
      ],
      loadWasm: shikiWasm,
      themes: [
        shikiThemeGitHubDarkDefault
      ]
    })
    code_output = highlighter.codeToHtml(code, {
      lang,
      theme: 'github-dark-default'
    })
  })
</script>
<div>{@html code_output}</div>
