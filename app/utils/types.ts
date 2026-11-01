// app/utils/types.ts
// ^ the shapes and fixed values every other calculator file agrees on.
// & nothing here does any work — it only describes what the data looks like.

// &one finished sum, as it is kept in history.
// &raw = what to put back in the calculator, shown = what to read on screen
export type HistoryItem = { raw: string; shown: string; result: string }

// &one run of text on the display, already worked out for size and height.
// &bar = does it get a line over it (under a √), level = how high it sits
export type DisplayPart = { text: string; bar: boolean; level: number; chunks: string[] }

// &how many sums to keep before the oldest ones drop off the end
export const MAX_HISTORY = 20

// &a marker for where the cursor is. it is slipped into the text just for
// &drawing, so it travels inside whichever run it lands in and comes out at
// &the right size and height — even inside an exponent or under a root bar.
export const CURSOR = '\u0001'

// &where the arrow pad can send the cursor
export type CursorMove = 'left' | 'right' | 'start' | 'end'

// &the operators that sit between two values, as the keypad sends them
export type Operator = '+' | '-' | '×' | '÷' | '^'
