// app/utils/history.ts
// ^ the saved list of finished sums, newest first.
// & every function here takes a list and returns a NEW list. none of them edit
// & the list they were handed — the caller decides what to do with the result.

import { MAX_HISTORY, type HistoryItem } from './types'
import { prettify } from './display'

// &drop anything that isn't a proper entry, in case the saved data is old
export function sanitizeHistory(items: unknown, max = MAX_HISTORY): HistoryItem[] {
  if (!Array.isArray(items)) return []
  return items
    .filter((item): item is HistoryItem =>
      !!item &&
      typeof item.raw === 'string' &&
      typeof item.shown === 'string' &&
      typeof item.result === 'string')
    .slice(0, max)
}

// &Ans should survive a refresh too — the newest saved result IS the last answer
export function lastAnswerFrom(history: HistoryItem[], fallback = 0): number {
  const newest = history[0]
  if (newest && Number.isFinite(Number(newest.result))) return Number(newest.result)
  return fallback
}

// &adds one sum to the front and trims the tail, so the list stops growing
export function pushHistory(history: HistoryItem[], raw: string, result: string, max = MAX_HISTORY): HistoryItem[] {
  return [{ raw, shown: prettify(raw), result }, ...history].slice(0, max)
}
