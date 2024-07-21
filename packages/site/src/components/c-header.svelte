<script lang="ts">
  import CButton from '~/components/c-button.svelte'
  import CTooltip from '~/components/c-tooltip.svelte'
  import {onMount} from 'svelte'
  let theme : 'dark' | 'light' = 'dark'
  onMount(() => {

  })
</script>
<header class="sad8a0aa7353">
  <CButton label="Home" link="/"/>
  <nav class="o180e1ca90a4">
    <CButton label="Categories"/>
  </nav>
  <CTooltip text="Switch to {theme === 'dark' ? 'light' : 'dark'} mode">
    <CButton element="div" icon={theme === 'dark' ? 'light_mode' : 'dark_mode'}/>
  </CTooltip>
</header>
<style>
  .o180e1ca90a4 {
    align-items: center;
    display: flex;
  }
  .sad8a0aa7353 {
    align-items: center;
    background-color: #0f172a;
    border-bottom-left-radius: 0.5rem;
    border-bottom-right-radius: 0.5rem;
    box-sizing: border-box;
    display: flex;
    height: 4rem;
    justify-content: space-between;
    margin-left: auto;
    margin-right: auto;
    max-width: 80rem;
    padding-left: 1rem;
    padding-right: 1rem;
  }
</style>