import { defineStore } from 'pinia'
import type { HistoryItem, DisplayPart, Operator, CursorMove } from '~/utils/types'
import { buildDisplayParts } from '~/utils/display'
import { dotToInsert, endsWithValue } from '~/utils/input'
import { evaluateExpression } from '~/utils/parser'
import { format } from '~/utils/math'
import { pushHistory, sanitizeHistory, lastAnswerFrom } from '~/utils/history'

export type CalculatorTheme = 'obsidian' | 'cyberpunk' | 'retro-amber' | 'slate'

export interface ActionLogItem {
  id: number
  name: string
  payload?: string | number | null
  timestamp: string
}

export const useCalculatorStore = defineStore('calculator', () => {
  // =========================================================================
  // STATE
  // =========================================================================
  const expr = ref('')
  const answer = ref<string | null>(null)
  const lastAnswer = ref<number>(0)
  const cursor = ref<number>(0)
  const history = ref<HistoryItem[]>([])
  
  // UX settings
  const soundEnabled = ref<boolean>(true)
  const theme = ref<CalculatorTheme>('obsidian')
  const actionLogs = ref<ActionLogItem[]>([])
  const isCopied = ref<boolean>(false)

  let logIdCounter = 0

  // =========================================================================
  // GETTERS (Computed)
  // =========================================================================
  const beforeCursor = computed(() => expr.value.slice(0, cursor.value))
  const afterCursor = computed(() => expr.value.slice(cursor.value))
  
  const displayParts = computed<DisplayPart[]>(() => 
    buildDisplayParts(beforeCursor.value, afterCursor.value)
  )

  const hasExpression = computed(() => expr.value.length > 0)
  const historyCount = computed(() => history.value.length)
  const isResultReady = computed(() => answer.value !== null)

  // =========================================================================
  // SOUND / HAPTIC FEEDBACK (Web Audio API)
  // =========================================================================
  function playClickSound(type: 'num' | 'op' | 'action' | 'equal' = 'num') {
    if (!soundEnabled.value || !import.meta.client) return
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!AudioContextClass) return
      const ctx = new AudioContextClass()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      const freqs = {
        num: 520,
        op: 680,
        action: 420,
        equal: 880,
      }

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freqs[type] || 500, ctx.currentTime)

      gain.gain.setValueAtTime(0.04, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start()
      osc.stop(ctx.currentTime + 0.04)
    } catch {
      // AudioContext failed or blocked by autoplay policy
    }
  }

  // Record an action in the live state inspector stream
  function recordAction(name: string, payload?: string | number | null) {
    const timeStr = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
    actionLogs.value.unshift({
      id: ++logIdCounter,
      name,
      payload,
      timestamp: timeStr,
    })
    if (actionLogs.value.length > 25) {
      actionLogs.value.pop()
    }
  }

  // =========================================================================
  // ACTIONS
  // =========================================================================
  function insertAtCursor(text: string) {
    expr.value = beforeCursor.value + text + afterCursor.value
    cursor.value += text.length
  }

  function startNewLine() {
    if (answer.value === null) return
    expr.value = ''
    cursor.value = 0
    answer.value = null
  }

  function inputDigit(digit: string) {
    playClickSound('num')
    recordAction('inputDigit', digit)
    startNewLine()
    
    // Line cannot start with "0" unless followed by dot
    if (digit === '0' && beforeCursor.value === '') return
    if (beforeCursor.value.endsWith('A')) insertAtCursor('×')
    insertAtCursor(digit)
  }

  function inputDot() {
    playClickSound('num')
    recordAction('inputDot', '.')
    startNewLine()
    if (beforeCursor.value.endsWith('A')) insertAtCursor('×')
    const dot = dotToInsert(beforeCursor.value)
    if (dot) insertAtCursor(dot)
  }

  function inputSqrt() {
    playClickSound('op')
    recordAction('inputSqrt', '√')
    startNewLine()
    if (endsWithValue(beforeCursor.value)) insertAtCursor('×')
    insertAtCursor('√')
  }

  function inputNthRoot() {
    playClickSound('op')
    recordAction('inputNthRoot', 'ⁿ')
    startNewLine()
    if (!endsWithValue(beforeCursor.value)) return
    insertAtCursor('ⁿ')
  }

  function inputAns() {
    playClickSound('num')
    recordAction('inputAns', 'Ans')
    startNewLine()
    if (endsWithValue(beforeCursor.value)) insertAtCursor('×')
    insertAtCursor('A')
  }

  function chooseOperator(op: Operator) {
    playClickSound('op')
    recordAction('chooseOperator', op)
    if (answer.value !== null) {
      if (answer.value === 'Error') {
        clearAll()
        return
      }
      // Chain next calculation using previous answer
      expr.value = answer.value
      cursor.value = expr.value.length
      answer.value = null
    }

    // If starting on an empty line with an operator like +, ×, ÷, ^: use Ans if available
    if (beforeCursor.value === '' && afterCursor.value === '' && op !== '-') {
      if (lastAnswer.value !== 0) {
        insertAtCursor('A')
      } else {
        return
      }
    }

    // If preceding character is already an operator, replace it
    if (/[+\-×÷^]$/.test(beforeCursor.value)) {
      const before = beforeCursor.value.slice(0, -1)
      expr.value = before + op + afterCursor.value
      return
    }

    insertAtCursor(op)
  }

  function toggleNegate() {
    playClickSound('op')
    recordAction('toggleNegate')
    startNewLine()
    if (beforeCursor.value === '' || /[+×÷^]$/.test(beforeCursor.value)) {
      insertAtCursor('-')
    } else if (beforeCursor.value.endsWith('-')) {
      const before = beforeCursor.value.slice(0, -1)
      expr.value = before + afterCursor.value
      cursor.value = Math.max(0, cursor.value - 1)
    } else if (endsWithValue(beforeCursor.value)) {
      insertAtCursor('×-')
    } else {
      insertAtCursor('-')
    }
  }

  function backspace() {
    playClickSound('action')
    recordAction('backspace')
    if (answer.value !== null) {
      answer.value = null
      return
    }
    if (cursor.value === 0) return
    
    // Remove the single character right before cursor
    const before = beforeCursor.value.slice(0, -1)
    expr.value = before + afterCursor.value
    cursor.value = Math.max(0, cursor.value - 1)
  }

  function moveCursor(where: CursorMove) {
    playClickSound('action')
    recordAction('moveCursor', where)
    answer.value = null

    if (where === 'left') cursor.value = Math.max(0, cursor.value - 1)
    else if (where === 'right') cursor.value = Math.min(expr.value.length, cursor.value + 1)
    else if (where === 'start') cursor.value = 0
    else cursor.value = expr.value.length
  }

  function setCursorPosition(newPos: number) {
    answer.value = null
    cursor.value = Math.max(0, Math.min(expr.value.length, newPos))
  }

  function equals() {
    playClickSound('equal')
    recordAction('equals')
    if (expr.value === '') return
    cursor.value = expr.value.length

    try {
      const result = evaluateExpression(expr.value, lastAnswer.value)
      answer.value = format(result)

      if (Number.isFinite(result)) {
        lastAnswer.value = result
        history.value = pushHistory(history.value, expr.value, answer.value)
      }
    } catch {
      answer.value = 'Error'
    }
    saveStateToStorage()
  }

  function restoreHistory(raw: string) {
    playClickSound('action')
    recordAction('restoreHistory', raw)
    expr.value = raw
    cursor.value = raw.length
    answer.value = null
  }

  function clearHistory() {
    playClickSound('action')
    recordAction('clearHistory')
    history.value = []
    saveStateToStorage()
  }

  function clearAll() {
    playClickSound('action')
    recordAction('clearAll')
    expr.value = ''
    cursor.value = 0
    answer.value = null
  }

  function toggleSound() {
    soundEnabled.value = !soundEnabled.value
    if (soundEnabled.value) playClickSound('action')
    saveStateToStorage()
  }

  function setTheme(newTheme: CalculatorTheme) {
    theme.value = newTheme
    saveStateToStorage()
  }

  async function copyToClipboard(textToCopy?: string) {
    const text = textToCopy ?? (answer.value ?? expr.value)
    if (!text || !import.meta.client) return
    try {
      await navigator.clipboard.writeText(text)
      isCopied.value = true
      setTimeout(() => {
        isCopied.value = false
      }, 1800)
    } catch {
      // Clipboard write failed
    }
  }

  // =========================================================================
  // PERSISTENCE (localStorage sync)
  // =========================================================================
  function saveStateToStorage() {
    if (!import.meta.client) return
    try {
      localStorage.setItem('calc-history', JSON.stringify(history.value))
      localStorage.setItem('calc-last', String(lastAnswer.value))
      localStorage.setItem('calc-sound', JSON.stringify(soundEnabled.value))
      localStorage.setItem('calc-theme', theme.value)
    } catch {
      // Storage unavailable or disabled
    }
  }

  function loadStateFromStorage() {
    if (!import.meta.client) return
    try {
      const savedHistory = localStorage.getItem('calc-history')
      if (savedHistory) {
        history.value = sanitizeHistory(JSON.parse(savedHistory))
        lastAnswer.value = lastAnswerFrom(history.value, lastAnswer.value)
      }

      const savedSound = localStorage.getItem('calc-sound')
      if (savedSound !== null) {
        soundEnabled.value = JSON.parse(savedSound)
      }

      const savedTheme = localStorage.getItem('calc-theme') as CalculatorTheme | null
      if (savedTheme && ['obsidian', 'cyberpunk', 'retro-amber', 'slate'].includes(savedTheme)) {
        theme.value = savedTheme
      }
    } catch {
      // ignore corrupt data
    }
  }

  // Initialize on client
  if (import.meta.client) {
    loadStateFromStorage()
  }

  return {
    // State
    expr,
    answer,
    lastAnswer,
    cursor,
    history,
    soundEnabled,
    theme,
    actionLogs,
    isCopied,
    // Getters
    beforeCursor,
    afterCursor,
    displayParts,
    hasExpression,
    historyCount,
    isResultReady,
    // Actions
    inputDigit,
    inputDot,
    inputSqrt,
    inputNthRoot,
    inputAns,
    chooseOperator,
    toggleNegate,
    backspace,
    moveCursor,
    setCursorPosition,
    equals,
    restoreHistory,
    clearHistory,
    clearAll,
    toggleSound,
    setTheme,
    copyToClipboard,
    loadStateFromStorage,
  }
})

