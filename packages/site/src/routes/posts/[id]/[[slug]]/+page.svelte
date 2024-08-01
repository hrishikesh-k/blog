<script lang="ts">
  import {page} from '$app/stores'
  import type {PageData} from './$types'
  export let data : PageData
</script>
<h1>{data.post.title}</h1>
<svelte:head>
  {#if !$page.params.slug}
    <!-- TODO: Change domain -->
    <link href="https://www.hrishikeshk.blog/posts/{data.post.id}/{data.post.slug}/" rel="canonical"/>
  {/if}
</svelte:head>