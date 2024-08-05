<script lang="ts">
  import {expoOut} from 'svelte/easing'
  import LazyLoad from 'vanilla-lazyload'
  import {onMount} from 'svelte'
  import {navigating} from '$app/stores'
  import PHeader from '~/partials/p-header.svelte'
  import {slide} from 'svelte/transition'
  import '~/tailwind.css'
  onMount(() => {
    window.ll = new LazyLoad({
      callback_loaded(el) {
        el.classList.remove('blur')
      },
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