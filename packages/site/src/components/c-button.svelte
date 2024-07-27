<script lang="ts">
  import CIcon from '~/components/c-icon.svelte'
  import {cva} from 'class-variance-authority'
  import type {TCIconName} from '~/utils/types.ts'
  export let element : 'div' | null = null
  export let icon : TCIconName = ''
  export let label = ''
  export let link = ''
  export let title = ''
  export let type : 'button' | 'reset' | 'submit' = 'button'
  const btn_class = cva([
    'after:absolute',
    'after:duration-300',
    'after:h-full',
    'after:left-0',
    'after:rounded',
    'after:scale-75',
    'after:top-0',
    'after:w-full',
    'after:-z-10',
    'bg-transparent',
    'border-0',
    'box-border',
    'cursor-pointer',
    'duration-300',
    'flex',
    'font-bold',
    'font-inherit',
    'gap-x-1',
    'hover:after:bg-sky-900',
    'hover:after:scale-110',
    'hover:text-sky-400',
    'items-center',
    'justify-center',
    'min-h-8',
    'min-w-8',
    'no-underline',
    'p-1.5',
    'relative',
    'text-inherit',
    'z-10'
  ])
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
<svelte:element class={btn_class()} {...props} this="{link.length ? 'a' : element ? element : 'button'}">
  {#if icon.length}
    <CIcon name={icon}/>
  {/if}
  {#if label.length}
    <span>{label}</span>
  {/if}
  {#if link_external}
    <CIcon name="arrow-up-right-from-square" size={3}/>
  {/if}
</svelte:element>