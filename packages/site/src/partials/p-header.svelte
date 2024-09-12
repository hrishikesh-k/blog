<script lang="ts">
import { onMount } from 'svelte'
import CButton from '~/components/c-button.svelte'
import CTooltip from '~/components/c-tooltip.svelte'
let theme: 'dark' | 'light' = 'dark'
onMount(() => {
  // TODO
})
</script>
<header class="bg-slate-900 box-border flex h-16 items-center justify-between max-w-7xl mx-auto px-4 rounded-b-lg">
  <CButton label="Home" link="/"/>
  <nav class="flex items-center">
    <CButton label="Categories"/>
  </nav>
  <CTooltip text="Switch to {theme === 'dark' ? 'light' : 'dark'} mode">
    <CButton element="div" icon={theme === 'dark' ? 'light_mode' : 'dark_mode'}/>
  </CTooltip>
</header>