<script lang="ts">
import { computePosition, offset, shift } from '@floating-ui/dom'
import { tick } from 'svelte'
import { randomString, remToPx } from '~/lib/functions.ts'

export let text: string
const id = randomString()
let button: HTMLDivElement
let left = 0
let showTooltip = false
let span: HTMLSpanElement
let top = 0

async function onMouseover() {
  showTooltip = true
  await tick()
  if (button && span) {
    const pos = await computePosition(button, span, {
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
}

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