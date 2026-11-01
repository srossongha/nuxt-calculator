// app/utils/display.ts
// ^ turns the typed text into something that can be DRAWN.
// & parser.ts answers "what does this equal". this file answers "what should
// & this look like" — where the root bars go, and what rides up as an exponent.

import { CURSOR, type DisplayPart } from './types'

// &the stored text uses short codes, so swap them for what they mean.
// &history.ts uses this to build the label you read in the history list
export function prettify(text: string): string {
  return text.replace(/A/g, 'Ans').replace(/ⁿ/g, '√')
}

// &cut the text so √ can get a bar over what it covers
export function buildDisplayParts(beforeCursor: string, afterCursor: string): DisplayPart[] {
  const text = beforeCursor + CURSOR + afterCursor
  const parts: { text: string; bar: boolean; level: number }[] = []
  let i = 0

  // &reads one value the same way parser.ts's readUnary does: signs, then √… or
  // &a number. level = how high it sits (0 normal, 1 exponent, 2 exponent of one)
  function readValue(level: number, bar: boolean) {
    let signs = ''
    while (i < text.length && text[i] === '-') { signs += text[i]!; i++ }

    if (text[i] === '√') {
      i++
      parts.push({ text: signs + '√', bar, level }) // the hook has no bar itself
      readValue(level, true)                        // what it covers does
    } else {
      let num = ''
      while (i < text.length && /[0-9.A\u0001]/.test(text[i]!)) { num += text[i]!; i++ }
      const bare = num.split(CURSOR).join('')
      parts.push({ text: bare === '' && level > 0 ? num + '□' : signs + num, bar, level })
    }

    // &a root's degree: the value we just pushed jumps up to the TOP LEFT of the √
    if (text[i] === 'ⁿ') {
      parts[parts.length - 1]!.level = level + 1
      i++
      parts.push({ text: '√', bar, level })
      readValue(level, true) // what sits under the sign gets the bar
      return
    }

    // &an exponent rides one level higher, and the "^" itself is not drawn
    if (text[i] === '^') { i++; readValue(level + 1, false) }
  }

  while (i < text.length) {
    if (/[-0-9.A√\u0001]/.test(text[i]!)) readValue(0, false)
    else { parts.push({ text: text[i]!, bar: false, level: 0 }); i++ } // + - × ÷
  }

  // &"A" is only short for storing — on screen it reads as "Ans".
  // &chunks = the part split at the cursor, so the template can draw a bar between them
  return parts.map((p) => ({
    ...p,
    chunks: p.text.replace(/A/g, 'Ans').split(CURSOR),
  }))
}
