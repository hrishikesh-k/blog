<svelte:head>
  <title>Blog</title>
</svelte:head>
<slot/>
<style>
  @font-face {
    font-display: swap;
    font-family: 'Inter';
    font-style: oblique 0deg 10deg;
    font-weight: 100 900;
    src: url('~/fonts/inter-latin.woff2') format('woff2');
    unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
  }
  :global(.m71602350491) {
    background-color: #020617;
    color: #e0f2fe;
    font-family: Inter, sans-serif;
    height: 0;
    margin: 0;
    min-height: 100%;
    width: 100%;
  }
  :global(.ua69dfa1601d) {
    height: 0;
    min-height: 100%;
    width: 100%;
  }
  :global(.w76f44d3b595) {
    display: contents;
  }
</style>