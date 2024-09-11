import type {Config} from 'tailwindcss'
import plugin from 'tailwindcss/plugin'
import type {PluginAPI} from 'tailwindcss/types/config'
export default {
  content: ['./src/**/*.{html,svelte}'],
  corePlugins: {
    accentColor: false,
    accessibility: false,
    alignContent: false,
    alignItems: true,
    alignSelf: false,
    animation: false,
    appearance: false,
    aspectRatio: false,
    backdropBlur: false,
    backdropBrightness: false,
    backdropContrast: false,
    backdropFilter: false,
    backdropGrayscale: false,
    backdropHueRotate: false,
    backdropInvert: false,
    backdropOpacity: false,
    backdropSaturate: false,
    backdropSepia: false,
    backgroundAttachment: false,
    backgroundBlendMode: false,
    backgroundClip: false,
    backgroundColor: true,
    backgroundImage: false,
    backgroundOpacity: false,
    backgroundOrigin: false,
    backgroundPosition: false,
    backgroundRepeat: false,
    backgroundSize: false,
    blur: true,
    borderCollapse: false,
    borderColor: true,
    borderOpacity: false,
    borderRadius: true,
    borderSpacing: false,
    borderStyle: true,
    borderWidth: true,
    boxDecorationBreak: false,
    boxShadow: false,
    boxShadowColor: false,
    boxSizing: true,
    breakAfter: false,
    breakBefore: false,
    breakInside: false,
    brightness: false,
    captionSide: false,
    caretColor: false,
    clear: false,
    columns: false,
    contain: false,
    container: false,
    content: false,
    contrast: false,
    cursor: true,
    display: true,
    divideColor: false,
    divideOpacity: false,
    divideStyle: false,
    divideWidth: false,
    dropShadow: false,
    fill: true,
    filter: false,
    flex: false,
    flexBasis: false,
    flexDirection: true,
    flexGrow: false,
    flexShrink: false,
    flexWrap: false,
    float: false,
    fontFamily: true,
    fontSize: true,
    fontSmoothing: false,
    fontStyle: false,
    fontVariantNumeric: false,
    fontWeight: true,
    forcedColorAdjust: false,
    gap: true,
    gradientColorStops: false,
    grayscale: false,
    gridAutoColumns: false,
    gridAutoFlow: false,
    gridAutoRows: false,
    gridColumn: true,
    gridColumnEnd: false,
    gridColumnStart: false,
    gridRow: false,
    gridRowEnd: false,
    gridRowStart: false,
    gridTemplateColumns: true,
    gridTemplateRows: false,
    height: true,
    hueRotate: false,
    hyphens: false,
    inset: true,
    invert: false,
    isolation: false,
    justifyContent: true,
    justifyItems: false,
    justifySelf: false,
    letterSpacing: false,
    lineClamp: false,
    lineHeight: true,
    listStyleImage: false,
    listStylePosition: false,
    listStyleType: false,
    margin: true,
    maxHeight: false,
    maxWidth: true,
    minHeight: true,
    minWidth: true,
    mixBlendMode: false,
    objectFit: true,
    objectPosition: false,
    opacity: true,
    order: false,
    outlineColor: false,
    outlineOffset: false,
    outlineStyle: false,
    outlineWidth: false,
    overflow: true,
    overscrollBehavior: false,
    padding: true,
    placeContent: false,
    placeItems: false,
    placeSelf: false,
    placeholderColor: false,
    placeholderOpacity: false,
    pointerEvents: true,
    position: true,
    preflight: false,
    resize: false,
    ringColor: false,
    ringOffsetColor: false,
    ringOffsetWidth: false,
    ringOpacity: false,
    ringWidth: false,
    rotate: false,
    saturate: false,
    scale: true,
    scrollBehavior: false,
    scrollMargin: false,
    scrollPadding: false,
    scrollSnapAlign: false,
    scrollSnapStop: false,
    scrollSnapType: false,
    sepia: false,
    size: false,
    skew: false,
    space: false,
    stroke: false,
    strokeWidth: false,
    tableLayout: false,
    textAlign: true,
    textColor: true,
    textDecoration: true,
    textDecorationColor: false,
    textDecorationStyle: false,
    textDecorationThickness: false,
    textIndent: false,
    textOpacity: false,
    textOverflow: false,
    textTransform: false,
    textUnderlineOffset: false,
    textWrap: true,
    touchAction: false,
    transform: false,
    transformOrigin: true,
    transitionDelay: false,
    transitionDuration: true,
    transitionProperty: false,
    transitionTimingFunction: true,
    translate: true,
    userSelect: false,
    verticalAlign: false,
    visibility: false,
    whitespace: false,
    width: true,
    willChange: false,
    wordBreak: false,
    zIndex: true
  },
  plugins: [
    /* animate-delay */
    plugin((p: PluginAPI) => {
      p.matchUtilities(
        {
          'animate-delay': (v) => {
            return {
              'animation-delay': v
            }
          }
        },
        {
          modifiers: 'any',
          values: p.theme('transitionDelay')
        }
      )
    }),
    /* animate-duration */
    plugin((p: PluginAPI) => {
      p.matchUtilities(
        {
          'animate-duration': (v) => {
            return {
              'animation-duration': v
            }
          }
        },
        {
          values: p.theme('transitionDuration')
        }
      )
    }),
    /* animate-fil-mode */
    plugin((p: PluginAPI) => {
      p.matchUtilities(
        {
          'animate-fill': (v) => {
            return {
              'animation-fill-mode': v
            }
          }
        },
        {
          values: {
            forwards: 'forwards'
          }
        }
      )
    }),
    /* animate-name */
    plugin((p: PluginAPI) => {
      p.matchUtilities(
        {
          'animate-name': (v) => {
            return {
              'animation-name': v
            }
          }
        },
        {
          values: Object.keys(p.theme('keyframes')).reduce(
            (o, k) => {
              const clonedObj = o
              clonedObj[k] = k
              return clonedObj
            },
            {} as Record<string, string>
          )
        }
      )
    }),
    /* animate-timing-function */
    plugin((p: PluginAPI) => {
      p.matchUtilities(
        {
          'animate-ease': (v) => {
            return {
              'animation-timing-function': v
            }
          }
        },
        {
          values: p.theme('transitionTimingFunction')
        }
      )
    }),
    /* pointer-events */
    plugin((p: PluginAPI) => {
      p.matchUtilities(
        {
          'pointer-events': (v) => {
            return {
              'pointer-events': v
            }
          }
        },
        {
          values: p.theme('pointerEvents')
        }
      )
    }),
    /* transform-box */
    plugin((p: PluginAPI) => {
      p.addUtilities({
        '.transform-box-border': {
          'transform-box': 'border-box'
        }
      })
    })
  ],
  theme: {
    extend: {
      fontFamily: {
        inherit: 'inherit',
        sans: ["'Inter'", 'sans-serif']
      },
      fontSize: {
        inherit: 'inherit'
      },
      keyframes: {
        float: {
          /* keyframes in src/tailwind.css */
        },
        fly: {
          /* keyframes in src/tailwind.css */
        }
      }
    }
  }
} satisfies Config
