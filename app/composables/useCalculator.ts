// app/composables/useCalculator.ts
// ^ Bridge composable: connects components to the Pinia calculator store.
// & In modern Vue/Nuxt architecture, state lives in stores (app/stores/calculator.ts),
// & while composables provide convenient hooks and reactive bindings.

import { storeToRefs } from 'pinia'
import { useCalculatorStore } from '~/stores/calculator'

export function useCalculator() {
  const store = useCalculatorStore()
  
  // storeToRefs preserves reactivity when destructuring state and getters
  const {
    expr,
    answer,
    lastAnswer,
    cursor,
    history,
    soundEnabled,
    theme,
    actionLogs,
    isCopied,
    beforeCursor,
    afterCursor,
    displayParts,
    hasExpression,
    historyCount,
    isResultReady,
  } = storeToRefs(store)

  return {
    // Reactive State & Getters
    expr,
    answer,
    lastAnswer,
    cursor,
    history,
    soundEnabled,
    theme,
    actionLogs,
    isCopied,
    beforeCursor,
    afterCursor,
    displayParts,
    hasExpression,
    historyCount,
    isResultReady,

    // Store Actions
    inputDigit: store.inputDigit,
    inputDot: store.inputDot,
    inputSqrt: store.inputSqrt,
    inputNthRoot: store.inputNthRoot,
    inputAns: store.inputAns,
    chooseOperator: store.chooseOperator,
    toggleNegate: store.toggleNegate,
    backspace: store.backspace,
    moveCursor: store.moveCursor,
    setCursorPosition: store.setCursorPosition,
    equals: store.equals,
    restoreHistory: store.restoreHistory,
    clearHistory: store.clearHistory,
    clearAll: store.clearAll,
    toggleSound: store.toggleSound,
    setTheme: store.setTheme,
    copyToClipboard: store.copyToClipboard,
    
    // Direct store reference
    store,
  }
}