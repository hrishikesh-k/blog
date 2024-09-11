<script lang="ts">
  import {computePosition, offset, shift} from '@floating-ui/dom'
  import {randomString, remToPx} from '~/lib/functions.ts'
  import {tick} from 'svelte'

  export let text : string
  // biome-ignore lint/correctness/noUnusedVariables: Svelte support
  const id = randomString()
  let button : HTMLDivElement
  // biome-ignore lint/correctness/noUnusedVariables: Svelte support
  let left = 0
  // biome-ignore lint/correctness/noUnusedVariables: Svelte support
  let showTooltip = false
  let span : HTMLSpanElement
  // biome-ignore lint/correctness/noUnusedVariables: Svelte support
  let top = 0

  // biome-ignore lint/correctness/noUnusedVariables: Svelte support
  async function onMouseover() {
    showTooltip = true
    await tick()
    const pos = await computePosition(button!, span!, {
      middleware: [
        offset(remToPx(0.5)),
        shift({
          padding: remToPx(1)
        })
      ]
    })
    left = pos.x
    top = pos.y
  }

  // biome-ignore lint/correctness/noUnusedVariables: Svelte support
  function onMouseout() {
    showTooltip = false
  }
</script>
<div aria-label={showTooltip ? null : text} aria-describedby={showTooltip ? id : null} class="relative" on:blur={onMouseout} on:focus={onMouseover} on:mouseover={onMouseover} on:mouseout={onMouseout} role="button" tabindex="0">
  <!-- can't use display:contents because of: https://github.com/floating-ui/floating-ui/issues/2403 -->
  <div bind:this={button}>
    <slot/>
  </div>
  {#if showTooltip}
    <span bind:this={span} class="absolute bg-slate-950 border border-current box-border border-solid left-0 p-1 rounded-sm text-nowrap text-xs top-0 u541109e5a0a" {id} role="tooltip" style:left="{left}px" style:top="{top}px">{text}</span>
  {/if}
</div>