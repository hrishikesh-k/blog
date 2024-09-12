<script lang="ts">
export let delay: number
export let paths: Array<{
  d: string
  f: string
}>
export let scale: number
export let translate: number
export let x: number
export let y: number

let animation = true

function animationEnd() {
  animation = false
}
</script>
<g class="animate-delay-[var(--d)] animate-duration-500 animate-ease-in-out animate-name-float group opacity-[var(--o)] pointer-events-[var(--p)] translate-y-[var(--t)]" on:animationend|once={animationEnd} style:--d="{delay}s" style:--o={animation ? '0' : '1'} style:--p={animation ? 'none' : 'unset'} style:--t={animation ? '-3rem' : '0'}>
  <path d={paths[0].d} fill={paths[0].f}/>
  <rect class="duration-300 ease-in-out group-hover:scale-y-150 origin-bottom scale-y-[var(--s)] translate-y-[var(--t)] transform-box-border" fill={paths[0].f} height="48" style:--s={animation ? '0' : scale} style:--t={animation ? '0.0625rem' : '0'} width="96" {x} {y}/>
  <g class="duration-300 ease-in-out group-hover:-translate-y-6 translate-y-[var(--t)]" style:--t={animation ? '3rem' : `${translate}rem`}>
    {#each paths.slice(1) as path}
      <path d={path.d} fill={path.f}/>
    {/each}
  </g>
</g>