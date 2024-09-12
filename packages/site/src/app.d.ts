import type { ILazyLoadInstance } from 'vanilla-lazyload'
declare global {
  interface Window {
    ll: ILazyLoadInstance
  }
}
