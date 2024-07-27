<script lang="ts">
  import {computePosition, offset, shift} from '@floating-ui/dom'
  import {random_string, rem_to_px} from '~/utils/functions.ts'
  import {tick} from 'svelte'

  export let text : string
  const id = random_string()
  let button : HTMLDivElement
  let left = 0
  let show_tooltip = false
  let span : HTMLSpanElement
  let top = 0

  async function on_mouseover() {
    show_tooltip = true
    await tick()
    const pos = await computePosition(button!, span!, {
      middleware: [
        offset(rem_to_px(0.5)),
        shift({
          padding: rem_to_px(1)
        })
      ]
    })
    left = pos.x
    top = pos.y
  }

  function on_mouseout() {
    show_tooltip = false
  }
</script>
<div aria-label={show_tooltip ? null : text} aria-describedby={show_tooltip ? id : null} class="relative" on:blur={on_mouseout} on:focus={on_mouseover} on:mouseover={on_mouseover} on:mouseout={on_mouseout} role="button" tabindex="0">
  <!-- can't use display:contents because of: https://github.com/floating-ui/floating-ui/issues/2403 -->
  <div bind:this={button}>
    <slot/>
  </div>
  {#if show_tooltip}
    <span bind:this={span} class="absolute bg-slate-950 border border-current box-border border-solid left-0 p-1 rounded-sm text-nowrap text-xs top-0 u541109e5a0a" {id} role="tooltip" style:left="{left}px" style:top="{top}px">{text}</span>
  {/if}
</div>