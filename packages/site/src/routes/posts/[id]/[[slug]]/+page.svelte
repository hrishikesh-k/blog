<script lang="ts">
  import CNotionCode from '~/components/c-notion-code.svelte'
  import CNotionImage from '~/components/c-notion-image.svelte'
  import {page} from '$app/stores'
  import type {PageData} from './$types'
  export let data : PageData
</script>
<svelte:head>
  <title>{data.post.title} | Blog</title>
  {#if !$page.params.slug}
    <!-- TODO: Change domain -->
    <link href="https://www.hrishikeshk.blog/posts/{data.post.id}/{data.post.slug}/" rel="canonical"/>
  {/if}
</svelte:head>
<h1>{data.post.title}</h1>
{#each data.post.blocks as block}
  {#if block.type === 'code'}
    <CNotionCode code={block.text} lang={block.language}/>
  {/if}
  {#if block.type === 'image'}
    <CNotionImage alt={block.alt} height={block.height} src="{data.post.id}/{block.id}" width={block.width}/>
  {/if}
{/each}
