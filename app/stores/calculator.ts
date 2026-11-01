// app/stores/calculator.ts
// ^ Centralized Pinia Store for the Scientific Calculator.
// & Manages expression, cursor, angle modes, shift mode, calculation history,
// & audio feedback, and localStorage persistence.

import { defineStore } from 'pinia'
import type {
  AngleMode,
  CursorMove,
  DisplayPart,
  HistoryItem,
  Operator,
} from '~/utils/types'
import { buildDisplayParts } from '~/utils/display'
import { dotToInsert, endsWithValue } from '~/utils/input'
import { evaluateExpression } from '~/utils/parser'
import { format } from '~/utils/math'
import {
  lastAnswerFrom,
  pushHistory,
  sanitizeHistory,
} from '~/utils/history'

export const useCalculatorStore = defineStore('calculator', () => {
  // =========================================================================
  // STATE
  // =========================================================================
  const expr = ref('')
  const answer = ref<string | null>(null)
  const lastAnswer = ref<number>(0)
  const cursor = ref<number>(0)
  const angleMode = ref<AngleMode>('DEG')
  const isShift = ref<boolean>(false)
  const history = ref<HistoryItem[]>([])
  const soundEnabled = ref<boolean>(true)
  const isCopied = ref<boolean>(false)

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
  const isDeg = computed(() => angleMode.value === 'DEG')

  // =========================================================================
  // SOUND FEEDBACK (Web Audio API)
  // =========================================================================
  function playClickSound(
    type: 'num' | 'op' | 'action' | 'equal' | 'shift' = 'num'
  ) {
    if (!soundEnabled.value || !import.meta.client) return
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      const freqs = {
        num: 560,
        op: 720,
        action: 400,
        equal: 880,
        shift: 960,
      }

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freqs[type] || 500, ctx.currentTime)

      gain.gain.setValueAtTime(0.04, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.035)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start()
      osc.stop(ctx.currentTime + 0.035)
    } catch {
      // Audio autoplay policy or unavailable
    }
  }

  // =========================================================================
  // INTERNAL HELPERS
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

  // =========================================================================
  // ACTIONS
  // =========================================================================
  function inputDigit(digit: string) {
    playClickSound('num')
    startNewLine()

    // Prevent leading zero unless followed by dot
    if (digit === '0' && beforeCursor.value === '') return
    if (beforeCursor.value.endsWith('A')) insertAtCursor('×')
    insertAtCursor(digit)
  }

  function inputDot() {
    playClickSound('num')
    startNewLine()
    if (beforeCursor.value.endsWith('A')) insertAtCursor('×')
    const dot = dotToInsert(beforeCursor.value)
    if (dot) insertAtCursor(dot)
  }

  function chooseOperator(op: Operator) {
    playClickSound('op')
    if (answer.value !== null) {
      if (answer.value === 'Error') {
        clearAll()
        return
      }
      expr.value = answer.value
      cursor.value = expr.value.length
      answer.value = null
    }

    // If typing an operator on empty line, use Ans if available
    if (beforeCursor.value === '' && afterCursor.value === '' && op !== '-') {
      if (lastAnswer.value !== 0) {
        insertAtCursor('A')
      } else {
        return
      }
    }

    // Replace consecutive operator if needed
    if (/[+\-×÷^]$/.test(beforeCursor.value)) {
      const before = beforeCursor.value.slice(0, -1)
      expr.value = before + op + afterCursor.value
      return
    }

    insertAtCursor(op)
  }

  // Scientific Functions (sin, cos, tan, log, ln, etc.)
  function inputFunction(fn: string) {
    playClickSound('op')
    startNewLine()
    if (endsWithValue(beforeCursor.value)) {
      insertAtCursor('×')
    }
    insertAtCursor(fn + '(')
    isShift.value = false
  }

  // Constants: π and e
  function inputConstant(c: 'π' | 'e') {
    playClickSound('num')
    startNewLine()
    if (endsWithValue(beforeCursor.value)) {
      insertAtCursor('×')
    }
    insertAtCursor(c)
  }

  // Parentheses: ( and )
  function inputParenthesis(p: '(' | ')') {
    playClickSound('op')
    startNewLine()
    if (p === '(' && endsWithValue(beforeCursor.value)) {
      insertAtCursor('×')
    }
    insertAtCursor(p)
  }

  // Powers and Roots
  function inputPower() {
    playClickSound('op')
    chooseOperator('^')
  }

  function inputSquare() {
    playClickSound('op')
    if (endsWithValue(beforeCursor.value)) {
      insertAtCursor('^2')
    }
  }

  function inputSqrt() {
    playClickSound('op')
    startNewLine()
    if (endsWithValue(beforeCursor.value)) {
      insertAtCursor('×')
    }
    insertAtCursor('√')
  }

  function inputCubeRoot() {
    playClickSound('op')
    startNewLine()
    if (endsWithValue(beforeCursor.value)) {
      insertAtCursor('×')
    }
    insertAtCursor('³√')
  }

  function inputNthRoot() {
    playClickSound('op')
    startNewLine()
    if (!endsWithValue(beforeCursor.value)) return
    insertAtCursor('ⁿ')
  }

  function inputFactorial() {
    playClickSound('op')
    if (endsWithValue(beforeCursor.value)) {
      insertAtCursor('!')
    }
  }

  function inputPercentage() {
    playClickSound('op')
    if (endsWithValue(beforeCursor.value)) {
      insertAtCursor('%')
    }
  }

  function inputReciprocal() {
    playClickSound('op')
    startNewLine()
    if (endsWithValue(beforeCursor.value)) {
      insertAtCursor('^(-1)')
    } else {
      insertAtCursor('1/(')
    }
  }

  function toggleNegate() {
    playClickSound('op')
    if (answer.value !== null) {
      if (answer.value === 'Error') {
        clearAll()
        return
      }
      expr.value = answer.value.startsWith('-')
        ? answer.value.slice(1)
        : '-' + answer.value
      cursor.value = expr.value.length
      answer.value = null
      return
    }

    if (beforeCursor.value === '' || /[+×÷^(]$/.test(beforeCursor.value)) {
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

  function toggleAngleMode() {
    playClickSound('action')
    angleMode.value = angleMode.value === 'DEG' ? 'RAD' : 'DEG'
    saveStateToStorage()
  }

  function toggleShift() {
    playClickSound('shift')
    isShift.value = !isShift.value
  }

  function inputAns() {
    playClickSound('num')
    startNewLine()
    if (endsWithValue(beforeCursor.value)) insertAtCursor('×')
    insertAtCursor('A')
  }

  function backspace() {
    playClickSound('action')
    if (answer.value !== null) {
      answer.value = null
      return
    }
    if (cursor.value === 0) return

    // Smart backspace: delete multi-character function tokens at once
    const funcMatches = ['asin(', 'acos(', 'atan(', 'sin⁻¹(', 'cos⁻¹(', 'tan⁻¹(', 'sin(', 'cos(', 'tan(', 'log(', 'ln(', 'abs(', '³√']
    for (const fn of funcMatches) {
      if (beforeCursor.value.endsWith(fn)) {
        const before = beforeCursor.value.slice(0, -fn.length)
        expr.value = before + afterCursor.value
        cursor.value = Math.max(0, cursor.value - fn.length)
        return
      }
    }

    // Default: delete 1 character before cursor
    const before = beforeCursor.value.slice(0, -1)
    expr.value = before + afterCursor.value
    cursor.value = Math.max(0, cursor.value - 1)
  }

  function moveCursor(where: CursorMove) {
    playClickSound('action')
    answer.value = null

    if (where === 'left') cursor.value = Math.max(0, cursor.value - 1)
    else if (where === 'right')
      cursor.value = Math.min(expr.value.length, cursor.value + 1)
    else if (where === 'start') cursor.value = 0
    else cursor.value = expr.value.length
  }

  function setCursorPosition(newPos: number) {
    answer.value = null
    cursor.value = Math.max(0, Math.min(expr.value.length, newPos))
  }

  function equals() {
    playClickSound('equal')
    if (expr.value === '') return
    cursor.value = expr.value.length

    try {
      const result = evaluateExpression(
        expr.value,
        lastAnswer.value,
        angleMode.value
      )
      answer.value = format(result)

      if (Number.isFinite(result)) {
        lastAnswer.value = result
        history.value = pushHistory(
          history.value,
          expr.value,
          answer.value,
          angleMode.value
        )
      }
    } catch {
      answer.value = 'Error'
    }

    saveStateToStorage()
  }

  function restoreHistory(raw: string) {
    playClickSound('action')
    expr.value = raw
    cursor.value = raw.length
    answer.value = null
  }

  function clearHistory() {
    playClickSound('action')
    history.value = []
    saveStateToStorage()
  }

  function clearAll() {
    playClickSound('action')
    expr.value = ''
    cursor.value = 0
    answer.value = null
    isShift.value = false
  }

  function toggleSound() {
    soundEnabled.value = !soundEnabled.value
    if (soundEnabled.value) playClickSound('action')
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
      }, 1600)
    } catch {
      // Clipboard write blocked
    }
  }

  // =========================================================================
  // PERSISTENCE (localStorage)
  // =========================================================================
  function saveStateToStorage() {
    if (!import.meta.client) return
    try {
      localStorage.setItem('calc-history', JSON.stringify(history.value))
      localStorage.setItem('calc-last', String(lastAnswer.value))
      localStorage.setItem('calc-sound', JSON.stringify(soundEnabled.value))
      localStorage.setItem('calc-angle-mode', angleMode.value)
    } catch {
      // Storage unavailable
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

      const savedAngle = localStorage.getItem('calc-angle-mode') as AngleMode | null
      if (savedAngle === 'DEG' || savedAngle === 'RAD') {
        angleMode.value = savedAngle
      }
    } catch {
      // Ignore corrupt storage
    }
  }

  if (import.meta.client) {
    loadStateFromStorage()
  }

  return {
    // State
    expr,
    answer,
    lastAnswer,
    cursor,
    angleMode,
    isShift,
    history,
    soundEnabled,
    isCopied,
    // Getters
    beforeCursor,
    afterCursor,
    displayParts,
    hasExpression,
    historyCount,
    isResultReady,
    isDeg,
    // Actions
    inputDigit,
    inputDot,
    chooseOperator,
    inputFunction,
    inputConstant,
    inputParenthesis,
    inputPower,
    inputSquare,
    inputSqrt,
    inputCubeRoot,
    inputNthRoot,
    inputFactorial,
    inputPercentage,
    inputReciprocal,
    toggleNegate,
    toggleAngleMode,
    toggleShift,
    inputAns,
    backspace,
    moveCursor,
    setCursorPosition,
    equals,
    restoreHistory,
    clearHistory,
    clearAll,
    toggleSound,
    copyToClipboard,
    loadStateFromStorage,
  }
})
