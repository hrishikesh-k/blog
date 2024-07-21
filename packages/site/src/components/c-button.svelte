<script lang="ts">
  import CIcon from '~/components/c-icon.svelte'
  import type {TCIconName} from '~/utils/types.ts'
  export let element : 'div' | null = null
  export let icon : TCIconName = ''
  export let label = ''
  export let link = ''
  export let title = ''
  export let type : 'button' | 'reset' | 'submit' = 'button'
  let link_external = false
  let props : {
    'aria-label'? : string
    href? : string
    rel? : 'noopener noreferrer'
    target? : '_blank'
    type? : typeof type
  } = {}
  $: {
    const computed_props : typeof props = {}

    /*
      check the length of the link prop
      if length (if length is 0, it will be false)
        if yes, it is a link
          assign the href attr
          check if link starts with '/'
            if yes, it's internal link
              set link_external to false
              link_external needs to be explicitly set to false,
              as it can be overwritten when props change
            if not, it's external link
              set link_external to true
              it will add the open_in_new icon after the link
              set the rel and target attr
        if not, it is a button
          check if element prop is provided
            if yes, don't set the type of the button
      */
    if (link.length) {
      computed_props.href = link
      if (link.startsWith('/')) {
        link_external = false
      } else {
        link_external = true
        computed_props.rel = 'noopener noreferrer'
        computed_props.target = '_blank'
      }
    } else {
      if (!element) {
        computed_props.type = type
      }
    }

    /*
      if element, label and title props are not provided, but icon is provided
        complain that title prop must also be provided
        this is because, if title is not provided,
        the component will render a link/button with an icon,
        but without any text, causing aria issues
      */
    if (!element && icon.length && !label.length && !title.length) {
      throw new Error('title must be supplied')
    }

    /*
      if element and label prop is not provided, set the aria-label attr
        if element prop is provided, it would be a div which should not have this attr
        if label is provided, the button/link already has a label, so attr not required
     */
    if (!element && !label.length) {
      computed_props['aria-label'] = title
    }

    props = computed_props
  }
</script>
<svelte:element class="ha9479c80a2d" {...props} this="{link.length ? 'a' : element ? element : 'button'}">
  {#if icon.length}
    <CIcon name={icon}/>
  {/if}
  {#if label.length}
    <span>{label}</span>
  {/if}
  {#if link_external}
    <CIcon name="open_in_new" size={3}/>
  {/if}
</svelte:element>
<style>
  .ha9479c80a2d {
    align-items: center;
    background-color: transparent;
    border-width: 0;
    box-sizing: border-box;
    color: inherit;
    column-gap: 0.25rem;
    cursor: pointer;
    display: flex;
    font-family: inherit;
    font-size: inherit;
    font-weight: 700;
    justify-content: center;
    min-height: 2rem;
    min-width: 2rem;
    padding: 0.375rem;
    position: relative;
    text-decoration-line: none;
    transition-duration: 250ms;
    z-index: 1;
    &:after {
      border-radius: 0.25rem;
      content: '';
      height: 100%;
      left: 0;
      position: absolute;
      transform: scale(0.75);
      top: 0;
      transition-duration: 250ms;
      width: 100%;
      z-index: -1;
    }
    &:hover {
      color: #38bdf8;
      &:after {
        background-color: #0c4a6e;
        transform: scale(1.125);
      }
    }
  }
</style>