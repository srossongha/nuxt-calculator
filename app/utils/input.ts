// app/utils/input.ts
// ^ the rules for what a key press is allowed to do.
// & these answer questions about the text you have typed SO FAR, so the
// & button handlers in useCalculator can decide what to insert (or to do nothing).

// &true if a whole value just finished at the end of this text: a number, or Ans.
// &used to spot "2" then √, which should quietly become 2×√
export function endsWithValue(text: string): boolean {
  return /[0-9.A]$/.test(text)
}

// &what a "." press should insert, or null when it should be ignored.
// &the number you're typing right now = whatever comes after the last operator
export function dotToInsert(beforeCursor: string): string | null {
  const current = beforeCursor.split(/[+\-×÷]/).pop() ?? ''
  if (current.includes('.')) return null            // it already has a dot
  return current === '' ? '0.' : '.'                // no digits yet? start it with "0."
}
