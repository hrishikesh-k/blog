<script lang="ts">
  import {c_icons} from '~/utils/constants.ts'
  import type {TCIconName} from '~/utils/types.ts'
  export let name : TCIconName
  export let size = 4
  $: d = c_icons[name as Exclude<TCIconName, ''>] || c_icons.notdef
  $: s = size * 4
</script>
<svg class="fill-current" height={s} viewBox="0 0 24 24" width={s} xmlns="http://www.w3.org/2000/svg">
  <path {d}/>
</svg>