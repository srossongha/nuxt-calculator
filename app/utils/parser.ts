// app/utils/parser.ts
// ^ turns the typed text into a number.
// & two stages: tokenize() chops the text into pieces, evaluate() reads the
// & pieces and works out the answer. neither knows anything about Vue.

import { calculate } from './math'

// splits the text into pieces:  "5+3×2"  ->  ["5", "+", "3", "×", "2"]
// &digits and dots stick together into one piece, so "3.5" stays one number
// &instead of becoming "3", ".", "5"
export function tokenize(text: string): string[] {
  const tokens: string[] = []
  let i = 0
  while (i < text.length) {
    const char = text[i]!
    if (/\s/.test(char)) {
      i++
      continue
    }
    if (/[0-9.]/.test(char)) {
      let number = char
      i++
      while (i < text.length && /[0-9.]/.test(text[i]!)) {
        number += text[i]!
        i++
      }
      tokens.push(number)
    } else {
      tokens.push(char) // +, -, ×, ÷, ^, ⁿ, √, A
      i++
    }
  }
  return tokens
}

// ^---- the precedence ladder ----------------------------------------------
// & each function below handles ONE strength of operator, weakest at the top.
// & each one asks the function below it for its values, so the stronger
// & operators are always worked out before the weaker ones get to act.
// &
// &   readExpr    + -      weakest, splits the line last
// &   readTerm    × ÷
// &   readPower   ^ ⁿ
// &   readUnary   -5 √9 A  strongest, sticks to one value
// &
// &lastAnswer is passed in instead of read from a ref — that's what makes this pure
export function evaluate(tokens: string[], lastAnswer = 0): number {
  let pos = 0 // which piece we're looking at

  // ^ + and -  (weakest, so it splits the expression last)
  function readExpr(): number {
    let value = readTerm()
    while (tokens[pos] === '+' || tokens[pos] === '-') {
      const op = tokens[pos]!
      pos++
      value = calculate(value, readTerm(), op)
    }
    return value
  }

  // ^ × and ÷  (stronger, so they get done first)
  function readTerm(): number {
    let value = readPower()
    while (tokens[pos] === '×' || tokens[pos] === '÷') {
      const op = tokens[pos]!
      pos++
      value = calculate(value, readPower(), op)
    }
    return value
  }

  // ^  (stronger than × ÷, so 2×3^2 is 2×9)
  // note the "if" and the call to itself: that makes 2^3^2 mean 2^(3^2),
  // because the right side scoops up all the rest before anything is worked out
  function readPower(): number {
    const base = readUnary()
    if (tokens[pos] === '^' || tokens[pos] === 'ⁿ') {
      const op = tokens[pos]!
      pos++
      return calculate(base, readPower(), op)
    }
    return base
  }

  // ^ strongest: a sign stuck in front of a value ("-5", "√9"), or just a number
  function readUnary(): number {
    if (tokens[pos] === '+') {
      pos++
      return readUnary()
    }
    if (tokens[pos] === '-') { //! ignore the minus if in the front expr
      pos++
      return -readUnary()
    }
    if (tokens[pos] === '√') { //! root first
      pos++
      return Math.sqrt(readUnary())
    }
    if (tokens[pos] === 'A') { //! Ans is a value, just like a number is
      pos++
      return lastAnswer
    }
    const value = parseFloat(tokens[pos]!)
    pos++
    return value
  }

  return readExpr()
}

// &the whole trip in one call: text in, number out
export function evaluateExpression(text: string, lastAnswer = 0): number {
  return evaluate(tokenize(text), lastAnswer)
}
