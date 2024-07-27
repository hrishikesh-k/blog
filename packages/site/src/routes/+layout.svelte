<script lang="ts">
  import LazyLoad from 'vanilla-lazyload'
  import {onMount} from 'svelte'
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
<slot/>