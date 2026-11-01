// app/utils/math.ts
// ^ Atomic mathematical operations and formatting.
// & Pure functions: numbers in, number out. No DOM and no Vue state.

import type { AngleMode } from './types'

export function toRad(angle: number, mode: AngleMode = 'DEG'): number {
  return mode === 'DEG' ? (angle * Math.PI) / 180 : angle
}

export function fromRad(rad: number, mode: AngleMode = 'DEG'): number {
  return mode === 'DEG' ? (rad * 180) / Math.PI : rad
}

export function sin(v: number, mode: AngleMode = 'DEG'): number {
  if (mode === 'DEG') {
    const norm = ((v % 360) + 360) % 360
    if (norm === 0 || norm === 180) return 0
    if (norm === 90) return 1
    if (norm === 270) return -1
  }
  return Math.sin(toRad(v, mode))
}

export function cos(v: number, mode: AngleMode = 'DEG'): number {
  if (mode === 'DEG') {
    const norm = ((v % 360) + 360) % 360
    if (norm === 90 || norm === 270) return 0
    if (norm === 0) return 1
    if (norm === 180) return -1
  }
  return Math.cos(toRad(v, mode))
}

export function tan(v: number, mode: AngleMode = 'DEG'): number {
  if (mode === 'DEG') {
    const norm = ((v % 360) + 360) % 360
    if (norm === 90 || norm === 270) return NaN
    if (norm === 0 || norm === 180) return 0
    if (norm === 45 || norm === 225) return 1
    if (norm === 135 || norm === 315) return -1
  }
  return Math.tan(toRad(v, mode))
}

export function asin(v: number, mode: AngleMode = 'DEG'): number {
  if (v < -1 || v > 1) return NaN
  return fromRad(Math.asin(v), mode)
}

export function acos(v: number, mode: AngleMode = 'DEG'): number {
  if (v < -1 || v > 1) return NaN
  return fromRad(Math.acos(v), mode)
}

export function atan(v: number, mode: AngleMode = 'DEG'): number {
  return fromRad(Math.atan(v), mode)
}

export function factorial(n: number): number {
  if (n < 0 || !Number.isInteger(n) || n > 170) return NaN
  if (n === 0 || n === 1) return 1
  let res = 1
  for (let i = 2; i <= n; i++) res *= i
  return res
}

export function calculate(a: number, b: number, op: string): number {
  if (op === '+') return a + b
  if (op === '-') return a - b
  if (op === '×' || op === '*') return a * b
  if (op === '÷' || op === '/') return a / b
  if (op === '^') return Math.pow(a, b)
  // ⁿ: a is the root degree, b is the radicand (e.g. 3ⁿ8 = 2)
  if (op === 'ⁿ') {
    if (b < 0 && Number.isInteger(a) && Math.abs(a % 2) === 1) {
      return -Math.pow(-b, 1 / a)
    }
    return Math.pow(b, 1 / a)
  }
  return b
}

// Cleanly format result for LCD screen display
export function format(n: number): string {
  if (!Number.isFinite(n) || Number.isNaN(n)) return 'Error'
  if (Math.abs(n) < 1e-12 && n !== 0) return '0'
  return String(Number(n.toPrecision(12)))
}
