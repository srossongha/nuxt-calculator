// app/utils/parser.ts
// ^ Mathematical expression tokenizer and recursive descent parser.
// & Supports scientific functions, parentheses, constants, implicit multiplication,
// & roots, powers, factorials, and configurable angle modes (DEG / RAD).

import type { AngleMode } from './types'
import {
  calculate,
  sin,
  cos,
  tan,
  asin,
  acos,
  atan,
  factorial,
} from './math'

// Splits expression text into meaningful mathematical tokens
export function tokenize(text: string): string[] {
  const tokens: string[] = []
  let i = 0

  while (i < text.length) {
    const char = text[i]!

    // Skip whitespace
    if (/\s/.test(char)) {
      i++
      continue
    }

    // Match multi-character function names and constants
    const remaining = text.slice(i)
    const match = remaining.match(
      /^(asin|acos|atan|sin⁻¹|cos⁻¹|tan⁻¹|sin|cos|tan|log|ln|abs|Ans|π|e)/
    )
    if (match && match[1]) {
      tokens.push(match[1])
      i += match[1].length
      continue
    }

    // Match numbers and decimals
    if (/[0-9.]/.test(char)) {
      let num = char
      i++
      while (i < text.length && /[0-9.]/.test(text[i]!)) {
        num += text[i]!
        i++
      }
      tokens.push(num)
    } else if (text.slice(i, i + 2) === '³√') {
      tokens.push('³√')
      i += 2
    } else {
      tokens.push(char) // +, -, ×, ÷, *, /, ^, ⁿ, √, (, ), !, %, A, etc.
      i++
    }
  }

  return tokens
}

function canStartPrimary(tok?: string): boolean {
  if (!tok) return false
  if (/^[0-9.]/.test(tok)) return true
  return [
    '(',
    'π',
    'e',
    'Ans',
    'A',
    'sin',
    'cos',
    'tan',
    'asin',
    'acos',
    'atan',
    'sin⁻¹',
    'cos⁻¹',
    'tan⁻¹',
    'log',
    'ln',
    'abs',
    '√',
    '³√',
  ].includes(tok)
}

// Evaluates a token stream with the precedence ladder
export function evaluate(
  tokens: string[],
  lastAnswer = 0,
  angleMode: AngleMode = 'DEG'
): number {
  let pos = 0

  // 1. Weakest: Addition and Subtraction
  function readExpr(): number {
    let value = readTerm()
    while (tokens[pos] === '+' || tokens[pos] === '-') {
      const op = tokens[pos]!
      pos++
      value = calculate(value, readTerm(), op)
    }
    return value
  }

  // 2. Medium: Multiplication and Division
  function readTerm(): number {
    let value = readPower()
    while (
      tokens[pos] === '×' ||
      tokens[pos] === '*' ||
      tokens[pos] === '÷' ||
      tokens[pos] === '/'
    ) {
      const op = tokens[pos]!
      pos++
      value = calculate(value, readPower(), op)
    }
    return value
  }

  // 3. Higher: Exponents and Roots (right-associative) + Implicit Multiplication
  function readPower(): number {
    const base = readPostfix()
    if (tokens[pos] === '^' || tokens[pos] === 'ⁿ') {
      const op = tokens[pos]!
      pos++
      return calculate(base, readPower(), op)
    }

    // Implicit multiplication: e.g. 2(3+4), 2π, 5sin(30), (2+1)(3+1)
    if (canStartPrimary(tokens[pos])) {
      return base * readPower()
    }

    return base
  }

  // 4. Postfix operators: Factorial (!) and Percentage (%)
  function readPostfix(): number {
    let val = readUnary()
    while (tokens[pos] === '!' || tokens[pos] === '%') {
      if (tokens[pos] === '!') {
        pos++
        val = factorial(val)
      } else if (tokens[pos] === '%') {
        pos++
        val = val / 100
      }
    }
    return val
  }

  // 5. Unary operators: +, -, √, ³√
  function readUnary(): number {
    if (tokens[pos] === '+') {
      pos++
      return readUnary()
    }
    if (tokens[pos] === '-') {
      pos++
      return -readUnary()
    }
    if (tokens[pos] === '√') {
      pos++
      return Math.sqrt(readUnary())
    }
    if (tokens[pos] === '³√') {
      pos++
      return Math.cbrt(readUnary())
    }
    return readPrimary()
  }

  // 6. Strongest: Primary atomic values, parenthesized subexpressions & functions
  function readPrimary(): number {
    const tok = tokens[pos]
    if (!tok) return NaN

    // Parentheses
    if (tok === '(') {
      pos++
      const val = readExpr()
      if (tokens[pos] === ')') pos++
      return val
    }

    // Functions
    if (
      [
        'sin',
        'cos',
        'tan',
        'asin',
        'acos',
        'atan',
        'sin⁻¹',
        'cos⁻¹',
        'tan⁻¹',
        'log',
        'ln',
        'abs',
      ].includes(tok)
    ) {
      pos++
      const arg = tokens[pos] === '(' ? readPrimary() : readUnary()

      if (tok === 'sin') return sin(arg, angleMode)
      if (tok === 'cos') return cos(arg, angleMode)
      if (tok === 'tan') return tan(arg, angleMode)
      if (tok === 'asin' || tok === 'sin⁻¹') return asin(arg, angleMode)
      if (tok === 'acos' || tok === 'cos⁻¹') return acos(arg, angleMode)
      if (tok === 'atan' || tok === 'tan⁻¹') return atan(arg, angleMode)
      if (tok === 'log') return Math.log10(arg)
      if (tok === 'ln') return Math.log(arg)
      if (tok === 'abs') return Math.abs(arg)
    }

    // Constants & Memory
    if (tok === 'π') {
      pos++
      return Math.PI
    }
    if (tok === 'e') {
      pos++
      return Math.E
    }
    if (tok === 'Ans' || tok === 'A') {
      pos++
      return lastAnswer
    }

    // Numbers
    const num = parseFloat(tok)
    pos++
    return num
  }

  return readExpr()
}

// One-shot helper to tokenize and evaluate expression text
export function evaluateExpression(
  text: string,
  lastAnswer = 0,
  angleMode: AngleMode = 'DEG'
): number {
  if (!text || text.trim() === '') return 0
  return evaluate(tokenize(text), lastAnswer, angleMode)
}
