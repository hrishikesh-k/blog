export function randomString() {
  const randomBytes = Array.from(crypto.getRandomValues(new Uint8Array(12)))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
  const randomChar = String.fromCharCode(Math.floor(Math.random() * 26) + 97)
  return `${randomChar + randomBytes}`.slice(0, 12)
}

export function remToPx(rem: number) {
  return (
    rem * Number.parseFloat(getComputedStyle(document.documentElement).fontSize)
  )
}

export function slugify(text: string) {
  /*
    convert to lowercase
    remove leading and trailing whitespace
    replace spaces and non-word characters with hyphens
    remove leading and trailing hyphens
  */
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
