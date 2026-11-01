// app/composables/useCalculator.ts
// ^ Bridge composable exposing reactive state and actions from the Pinia calculator store.

import { storeToRefs } from 'pinia'
import { useCalculatorStore } from '~/stores/calculator'

export function useCalculator() {
  const store = useCalculatorStore()

  // storeToRefs keeps reactive state and computed getters intact
  const {
    expr,
    answer,
    lastAnswer,
    cursor,
    angleMode,
    isShift,
    history,
    soundEnabled,
    isCopied,
    beforeCursor,
    afterCursor,
    displayParts,
    hasExpression,
    historyCount,
    isResultReady,
    isDeg,
  } = storeToRefs(store)

  return {
    // State & Getters
    expr,
    answer,
    lastAnswer,
    cursor,
    angleMode,
    isShift,
    history,
    soundEnabled,
    isCopied,
    beforeCursor,
    afterCursor,
    displayParts,
    hasExpression,
    historyCount,
    isResultReady,
    isDeg,

    // Store Actions
    inputDigit: store.inputDigit,
    inputDot: store.inputDot,
    chooseOperator: store.chooseOperator,
    inputFunction: store.inputFunction,
    inputConstant: store.inputConstant,
    inputParenthesis: store.inputParenthesis,
    inputPower: store.inputPower,
    inputSquare: store.inputSquare,
    inputSqrt: store.inputSqrt,
    inputCubeRoot: store.inputCubeRoot,
    inputNthRoot: store.inputNthRoot,
    inputFactorial: store.inputFactorial,
    inputPercentage: store.inputPercentage,
    inputReciprocal: store.inputReciprocal,
    toggleNegate: store.toggleNegate,
    toggleAngleMode: store.toggleAngleMode,
    toggleShift: store.toggleShift,
    inputAns: store.inputAns,
    backspace: store.backspace,
    moveCursor: store.moveCursor,
    setCursorPosition: store.setCursorPosition,
    equals: store.equals,
    restoreHistory: store.restoreHistory,
    clearHistory: store.clearHistory,
    clearAll: store.clearAll,
    toggleSound: store.toggleSound,
    copyToClipboard: store.copyToClipboard,

    // Direct store instance
    store,
  }
}
