// app/utils/history.ts
// ^ History queue management for finished calculations.
// & Pure functions: immutable list in, new list out.

import { MAX_HISTORY, type HistoryItem, type AngleMode } from './types'
import { prettify } from './display'

// Drops invalid or corrupted items from stored history
export function sanitizeHistory(
  items: unknown,
  max = MAX_HISTORY
): HistoryItem[] {
  if (!Array.isArray(items)) return []
  return items
    .filter(
      (item): item is HistoryItem =>
        !!item &&
        typeof item.raw === 'string' &&
        typeof item.shown === 'string' &&
        typeof item.result === 'string'
    )
    .slice(0, max)
}

// Extracts the last valid numeric answer from history
export function lastAnswerFrom(history: HistoryItem[], fallback = 0): number {
  const newest = history[0]
  if (newest && Number.isFinite(Number(newest.result))) {
    return Number(newest.result)
  }
  return fallback
}

// Adds calculation to the front of history with timestamp
export function pushHistory(
  history: HistoryItem[],
  raw: string,
  result: string,
  angleMode?: AngleMode,
  max = MAX_HISTORY
): HistoryItem[] {
  const time = new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
  return [
    {
      raw,
      shown: prettify(raw),
      result,
      angleMode,
      timestamp: time,
    },
    ...history,
  ].slice(0, max)
}
