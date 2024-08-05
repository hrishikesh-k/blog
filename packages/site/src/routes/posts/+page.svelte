<script lang="ts">
  import CIcon from '~/components/c-icon.svelte'
  import {format} from 'date-fns'
  import type {PageData} from './$types'
  export let data : PageData
</script>
<div class="box-border p-6">
  {#each data.posts as post}
    <div class="bg-sky-900 box-border p-6 rounded-xl">
      <a class="before:absolute before:bg-current before:block before:duration-300 before:ease-in-out before:h-5 before:left-0 before:rounded-md before:w-1 box-border block font-bold hover:before:scale-y-125 leading-5 mb-4 pl-4 no-underline relative text-2xl text-current" href="/posts/{post.id}/{post.slug}/">{post.title}</a>
      <div class="flex items-center">
        <div class="flex gap-x-1 items-center">
          <CIcon name="calendar-day"/>
          <span>{format(post.updated_at, 'yyyy-MM-dd')}</span>
        </div>
        <!-- TODO: add category and tags -->
      </div>
      <p class="m-0">{post.description}</p>
    </div>
  {/each}
</div>
<svelte:head>
  <title>Posts | Blog</title>
</svelte:head>
