import type {ILazyLoadInstance} from 'vanilla-lazyload'
declare global {
  declare module '*?meta' {
    export default {} as {
      height: number
      src: string
      width: number
    }
  }
  namespace App {
    PageData: {
    }
  }
  interface Window {
    ll: ILazyLoadInstance
  }
}
