<script lang="ts">
import { C_ICONS } from '~/lib/constants.ts'
import type { TCIconName } from '~/lib/types.ts'
export let name: TCIconName
export let size = 4
$: d = C_ICONS[name as Exclude<TCIconName, ''>] || C_ICONS.notdef
$: s = size * 4
</script>
<svg class="fill-current" height={s} viewBox="0 0 24 24" width={s} xmlns="http://www.w3.org/2000/svg">
  <path {d}/>
</svg>