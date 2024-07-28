<script lang="ts">
  import CNotionHeading from '~/components/c-notion-renderer/c-notion-heading.svelte'
  import type {PageData} from './$types'
  export let data : PageData
</script>
<h1>{data.post.title}</h1>
{#each data.post.content as block}
  {#if block.type === 'heading'}
    <CNotionHeading/>
  {/if}
{/each}