<script lang="ts">
  import {c_icons} from '~/lib/constants.ts'
  import type {TCIconName} from '~/lib/types.ts'
  export let name : TCIconName
  // biome-ignore lint/style/useConst: Svelte support
  export let size = 4
  // biome-ignore lint/correctness/noUndeclaredVariables: Svelte support
  $: d = c_icons[name as Exclude<TCIconName, ''>] || c_icons.notdef
  // biome-ignore lint/correctness/noUndeclaredVariables: Svelte support
  $: s = size * 4
</script>
<svg class="fill-current" height={s} viewBox="0 0 24 24" width={s} xmlns="http://www.w3.org/2000/svg">
  <path {d}/>
</svg>