<script lang="ts">
  import type {PageData} from './$types'
  export let data : PageData
</script>
{#each data.posts as post}
  <a href="/posts/{post.id}/{post.slug}/">{post.title}</a>
{/each}