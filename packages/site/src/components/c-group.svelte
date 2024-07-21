<script lang="ts">
  export let delay : number
  export let paths : Array<{
    d : string
    f : string
  }>
  export let scale : number
  export let translate : number
  export let x : number
  export let y : number
  let animation = true
  function animation_end() {
    animation = false
  }
</script>
<g class="b64e71bf76a9" on:animationend|once={animation_end} style:--delay="{delay}s" style:--opacity={animation ? '0' : '1'} style:--translate={animation ? '-3rem' : '0'}>
  <path d={paths[0].d} fill={paths[0].f}/>
  <rect class="k72356534146" fill={paths[0].f} height="48" style:--scale={animation ? '0' : scale} width="96" {x} {y}/>
  <g class="gb86bb1efa8d" style:--translate={animation ? '3rem' : `${translate}rem`}>
    {#each paths.slice(1) as path}
      <path d={path.d} fill={path.f}/>
    {/each}
  </g>
</g>
<style lang="scss">
  @keyframes k662fefa4ad4 {
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .b64e71bf76a9 {
    animation-delay: var(--delay);
    animation-duration: 500ms;
    animation-name: k662fefa4ad4;
    animation-timing-function: ease-in-out;
    opacity: var(--opacity);
    transform: translateY(var(--translate));
    &:hover {
      .gb86bb1efa8d {
        transform: translateY(-1.5rem);
      }
      .k72356534146 {
        transform: scaleY(1.5);
      }
    }
  }
  .gb86bb1efa8d {
    transform: translateY(var(--translate));
    transition-duration: 250ms;
    transition-timing-function: ease-in-out;
  }
  .k72356534146 {
    transform: scaleY(var(--scale));
    transform-box: border-box;
    transform-origin: bottom;
    transition-duration: 250ms;
    transition-timing-function: ease-in-out;
  }
</style>