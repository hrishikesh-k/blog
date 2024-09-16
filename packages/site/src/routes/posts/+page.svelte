<script lang="ts">
import { format } from 'date-fns'
import CButton from '~/components/c-button.svelte'
import CIcon from '~/components/c-icon.svelte'
import type { PageData } from './$types'
export let data: PageData
</script>
<svelte:head>
  <title>Posts | Blog</title>
</svelte:head>
<div class="box-border max-w-7xl mx-auto py-6">
  {#each data.posts as post}
    <div class="bg-slate-900 box-border p-6 rounded-xl">
      <a class="before:absolute before:bg-current before:block before:duration-300 before:ease-in-out before:h-5 before:left-0 before:rounded-md before:w-1 box-border block font-bold hover:before:scale-y-125 leading-5 mb-4 pl-4 no-underline relative text-2xl text-current" href="/posts/{post.id}/{post.slug}/">{post.title}</a>
      <div class="flex gap-x-2 items-center mb-2">
        <div class="flex gap-x-1 items-center">
          <div class="bg-sky-900 flex h-6 items-center justify-center rounded w-6">
            <CIcon name="calendar-day" size={3}/>
          </div>
          <span class="text-sm">{format(post.updated_at, 'yyyy-MM-dd')}</span>
        </div>
        <div class="flex gap-x-1 items-center">
          <div class="bg-sky-900 flex h-6 items-center justify-center rounded w-6">
            <CIcon name="hashtag" size={3}/>
          </div>
          {#each post.tags as tag}
            <CButton label={tag} link="/tags/{tag.toLowerCase()}" size="sm"/>
          {/each}
        </div>
        <!-- TODO: add category and tags -->
      </div>
      <p class="m-0">{post.description}</p>
    </div>
  {/each}
</div>
