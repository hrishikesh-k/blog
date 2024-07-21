<script lang="ts">
  import {computePosition, offset, shift} from '@floating-ui/dom'
  import {random_string, rem_to_px} from '~/utils/functions.ts'
  import {tick} from 'svelte'

  export let text: string
  const id = random_string()
  let button: HTMLDivElement
  let left = 0
  let show_tooltip = false
  let span: HTMLSpanElement
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
<div aria-label={show_tooltip ? null : text} aria-describedby={show_tooltip ? id : null} class="h49efafc4825"
     on:blur={on_mouseout} on:focus={on_mouseover} on:mouseover={on_mouseover} on:mouseout={on_mouseout} role="button"
     tabindex="0">
  <!-- can't use display:contents because of: https://github.com/floating-ui/floating-ui/issues/2403 -->
  <div bind:this={button}>
    <slot/>
  </div>
  {#if show_tooltip}
    <span bind:this={span} class="u541109e5a0a" {id} role="tooltip" style:left="{left}px"
          style:top="{top}px">{text}</span>
  {/if}
</div>
<style>
  .h49efafc4825 {
    position: relative;
  }

  .u541109e5a0a {
    background-color: #020617;
    border-color: currentColor;
    border-radius: 0.125rem;
    border-style: solid;
    border-width: 0.0625rem;
    box-sizing: border-box;
    font-size: 0.75rem;
    left: 0;
    padding: 0.25rem;
    position: absolute;
    text-wrap: nowrap;
    top: 0;
  }
</style>