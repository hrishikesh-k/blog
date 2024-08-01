export function random_string() {
  const random_bytes = Array.from(crypto.getRandomValues(new Uint8Array(12)))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('')
  const random_char = String.fromCharCode(Math.floor(Math.random() * 26) + 97)
  return `${random_char + random_bytes}`.slice(0, 12)
}

export function rem_to_px(rem : number) {
  return rem * parseFloat(getComputedStyle(document.documentElement).fontSize)
}

export function slugify(text : string) {
  /*
    convert to lowercase
    remove leading and trailing whitespace
    replace spaces and non-word characters with hyphens
    remove leading and trailing hyphens
  */
  return text.toLowerCase().trim().replace(/[\s\W-]+/g, '-').replace(/^-+|-+$/g, '')
}