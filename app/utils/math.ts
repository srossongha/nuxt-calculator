// app/utils/math.ts
// ^ one piece of arithmetic at a time: numbers in, number out.
// & no text and no parsing here — this file never sees the typed expression.

export function calculate(a: number, b: number, op: string): number {
  if (op === '+') return a + b
  if (op === '-') return a - b
  if (op === '×') return a * b
  if (op === '÷') return a / b
  if (op === '^') return Math.pow(a, b)
  // &ⁿ: a says which root, b is the number under the sign — "3ⁿ8" is the 3rd root of 8
  if (op === 'ⁿ') {
    // &odd roots of negatives are real (3rd root of -8 is -2), but Math.pow says NaN
    if (b < 0 && Number.isInteger(a) && Math.abs(a % 2) === 1) return -Math.pow(-b, 1 / a)
    return Math.pow(b, 1 / a)
  }
  return b
}

// tidies the result: hides float noise (0.1+0.2), shows ÷0 as "Error"
export function format(n: number): string {
  return Number.isFinite(n) ? String(Number(n.toPrecision(12))) : 'Error'
}
