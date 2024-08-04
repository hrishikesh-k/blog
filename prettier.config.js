/** @type {import('prettier').Config} */
const config = {
  arrowParens: 'always',
  bracketSameLine: true,
  bracketSpacing: false,
  embeddedLanguageFormatting: 'off',
  endOfLine: 'lf',
  htmlWhitespaceSensitivity: 'strict',
  insertPragma: false,
  jsxSingleQuote: true,
  overrides: [
    {
      files: '*.svelte',
      options: {
        parser: 'svelte'
      }
    }
  ],
  plugins: ['prettier-plugin-svelte', 'prettier-plugin-tailwindcss'],
  printWidth: 80,
  proseWrap: 'always',
  quoteProps: 'consistent',
  requirePragma: false,
  semi: false,
  singleAttributePerLine: true,
  singleQuote: true,
  svelteAllowShorthand: true,
  svelteIndentScriptAndStyle: true,
  svelteSortOrder: 'options-scripts-markup-styles',
  svelteStrictMode: true,
  tabWidth: 2,
  tailwindAttributes: [],
  tailwindConfig: './packages/site/tailwind.config.ts',
  tailwindFunctions: ['cva'],
  tailwindPreserveDuplicates: false,
  tailwindPreserveWhitespace: false,
  trailingComma: 'none',
  useTabs: false,
  vueIndentScriptAndStyle: true
}

export default config
