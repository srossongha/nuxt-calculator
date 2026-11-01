// app/utils/input.ts
// ^ Input validation and intelligent insertion rules.

// Returns true if expression ends with an atomic value or closing bracket
export function endsWithValue(text: string): boolean {
  return /[0-9.Aπe!)]$/.test(text)
}

// Determines whether typing a dot is allowed and what to insert
export function dotToInsert(beforeCursor: string): string | null {
  const current = beforeCursor.split(/[+\-×÷^ⁿ(]/).pop() ?? ''
  if (current.includes('.')) return null
  return current === '' || !/[0-9]$/.test(current) ? '0.' : '.'
}
