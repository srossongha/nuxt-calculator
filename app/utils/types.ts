// app/utils/types.ts
// ^ Shared types and constants for the Scientific Calculator.

export type AngleMode = 'DEG' | 'RAD'

// One finished calculation entry in history
export interface HistoryItem {
  raw: string
  shown: string
  result: string
  angleMode?: AngleMode
  timestamp?: string
}

// Visual run of text on the display
export interface DisplayPart {
  text: string
  bar: boolean
  level: number
  chunks: string[]
}

// Max history items persisted
export const MAX_HISTORY = 25

// Control character for tracking the cursor position in rendered text
export const CURSOR = '\u0001'

// Cursor navigation targets
export type CursorMove = 'left' | 'right' | 'start' | 'end'

// Binary operators
export type Operator = '+' | '-' | '×' | '÷' | '^' | 'ⁿ'
