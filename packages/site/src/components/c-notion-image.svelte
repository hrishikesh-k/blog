<script lang="ts">
  import {onMount} from 'svelte'
  export let alt : string
  export let max_width : number = 1920
  export let height : number
  export let src : string
  export let width : number
  const preset_widths = [320, 375, 414, 640, 768, 1024, 1280, 1440, 1920]
  function generate_image_cdn_url(w : number) {
    return `/.netlify/images?url=/images/${src}&w=${w}`
  }
  $: widths = preset_widths.filter(n => n < max_width).concat([
    max_width
  ])
  onMount(() => {
    window.ll.update()
  })
</script>
<picture class="block overflow-hidden">
  <!--
    The logic for the following block is as follows:
      - For each width of the generated widths array, do the following:
        - if the current width is last in the array:
          - if the widths array has more than 1 items:
            - set the min width to the second last width, but generate the image for the current width.
              this would be required when you're at the max width
          - else:
            - set the current width as the only available width.
              this would happen if you set a width lower than or equal to the min width from preset_widths
        - else:
          - set the current width as the max width and generate the image for the current width.
      - end loop
  -->
  {#each widths as width, i}
    {#if i === widths.length - 1}
      {#if widths.length > 1}
        <source data-srcset="{generate_image_cdn_url(width)}" media="(min-width: {widths[i - 1]}px)"/>
      {:else}
        <source data-srcset="{generate_image_cdn_url(width)}"/>
      {/if}
    {:else}
      <source data-srcset="{generate_image_cdn_url(width)}" media="(max-width: {width}px)"/>
    {/if}
  {/each}
  <img {alt} class="block blur duration-300 h-full object-contain w-full" {height} src="{generate_image_cdn_url(64)}" {width}/>
</picture>
