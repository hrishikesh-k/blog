<script lang="ts">
  import CButton from '~/components/c-button.svelte'
  import PAnimation from '~/partials/p-animation/p-animation.svelte'
</script>
<div class="box-border gap-x-16 grid grid-cols-1 h-full items-center lg:grid-cols-2 md:grid-cols-3 px-4 sm:grid-cols-2">
  <div class="col-span-1 flex flex-col gap-y-4 items-center">
    <div class="bg-black h-48 w-48"></div>
    <h1 class="m-0 text-center">Hi,<br/>I'm Hrishikesh Kokate</h1>
    <div class="flex gap-x-1 items-center">
      <CButton icon="circle-info" intent="filled" label="About" link="/about/"/>
      <CButton icon="newspaper" intent="filled" label="Blog" link="/posts/"/>
    </div>
  </div>
  <PAnimation/>
</div>