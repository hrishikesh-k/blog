<script lang="ts">
  // biome-ignore lint/correctness/noUnusedImports: Svelte support
  import {expoOut} from 'svelte/easing'
  import LazyLoad from 'vanilla-lazyload'
  import {onMount} from 'svelte'
  // biome-ignore lint/correctness/noUnusedImports: Svelte support
  import {navigating} from '$app/stores'
  // biome-ignore lint/correctness/noUnusedImports: Svelte support
  import PHeader from '~/partials/p-header.svelte'
  // biome-ignore lint/correctness/noUnusedImports: Svelte support
  import {slide} from 'svelte/transition'
  import '~/tailwind.css'
  onMount(() => {
    window.ll = new LazyLoad({
      // biome-ignore lint/style/useNamingConvention: LazyLoad's convention
      callback_loaded(el) {
        el.classList.remove('blur')
      },
      // biome-ignore lint/style/useNamingConvention: LazyLoad's convention
      elements_selector: 'img'
    })
  })
</script>
<svelte:head>
  <title>Blog</title>
</svelte:head>
{#if $navigating}
  <!-- https://github.com/scosman/sveltekit-navigation-loader/blob/main/%2Blayout.svelte -->
  <div class="bg-white fixed h-1 left-0 top-0 z-10" in:slide={{
    axis: 'x',
    delay: 100,
    duration: 12000,
    easing: expoOut
  }}></div>
{/if}
<PHeader/>
<slot/>