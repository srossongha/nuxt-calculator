// app/utils/display.ts
// ^ Prepares typed mathematical expressions for visual rendering.
// & Formats roots with overbars, powers with superscripts, and preserves cursor position.

import { CURSOR, type DisplayPart } from './types'

// Converts stored shorthand tokens into human-readable strings for history
export function prettify(text: string): string {
  return text.replace(/A/g, 'Ans').replace(/ⁿ/g, '√')
}

// Splits expression into styled display runs with root bars and superscript levels
export function buildDisplayParts(
  beforeCursor: string,
  afterCursor: string
): DisplayPart[] {
  const text = beforeCursor + CURSOR + afterCursor
  const parts: { text: string; bar: boolean; level: number }[] = []
  let i = 0

  function readValue(level: number, bar: boolean) {
    let signs = ''
    while (i < text.length && text[i] === '-') {
      signs += text[i]!
      i++
    }

    if (text[i] === '√') {
      i++
      parts.push({ text: signs + '√', bar, level })
      readValue(level, true)
    } else if (text.slice(i, i + 2) === '³√') {
      i += 2
      parts.push({ text: signs + '³√', bar, level })
      readValue(level, true)
    } else {
      let num = ''
      while (i < text.length && /[0-9.Aπe\u0001]/.test(text[i]!)) {
        num += text[i]!
        i++
      }
      const bare = num.split(CURSOR).join('')
      parts.push({
        text: bare === '' && level > 0 ? num + '□' : signs + num,
        bar,
        level,
      })
    }

    // Degree of nth root
    if (text[i] === 'ⁿ') {
      if (parts.length > 0) {
        parts[parts.length - 1]!.level = level + 1
      }
      i++
      parts.push({ text: '√', bar, level })
      readValue(level, true)
      return
    }

    // Exponent rides one level higher
    if (text[i] === '^') {
      i++
      readValue(level + 1, false)
    }
  }

  while (i < text.length) {
    if (/[-0-9.Aπe√\u0001]/.test(text[i]!)) {
      readValue(0, false)
    } else {
      parts.push({ text: text[i]!, bar: false, level: 0 })
      i++
    }
  }

  // Split into chunks along CURSOR to render the blinking cursor bar
  return parts.map((p) => ({
    ...p,
    chunks: p.text.replace(/A/g, 'Ans').split(CURSOR),
  }))
}
