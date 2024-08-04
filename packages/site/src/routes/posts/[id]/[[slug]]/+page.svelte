<script lang="ts">
  import CImage from '~/components/c-image.svelte'
  import {page} from '$app/stores'
  import type {PageData} from './$types'
  export let data : PageData
</script>
<h1>{data.post.title}</h1>
{#each data.post.blocks as block}
  {#if block.type === 'image'}
    <CImage alt={block.alt} height={block.height} src="/images/{data.post.id}/{block.id}" width={block.width}/>
  {/if}
{/each}
<svelte:head>
  {#if !$page.params.slug}
    <!-- TODO: Change domain -->
    <link href="https://www.hrishikeshk.blog/posts/{data.post.id}/{data.post.slug}/" rel="canonical"/>
  {/if}
</svelte:head>