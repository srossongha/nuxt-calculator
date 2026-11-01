// app/composables/counter.ts
// ^ Bridge composable for the Pinia counter store.
// & Demonstrates state management: compare Pinia store with local ref and useState!

import { storeToRefs } from 'pinia'
import { useCounterStore } from '~/stores/counter'

export function useCounter() {
  const store = useCounterStore()
  const { count, doubleCount, isEven } = storeToRefs(store)

  return {
    counter: count,
    count,
    doubleCount,
    isEven,
    increment: store.increment,
    incresment: store.increment, // alias for backwards compatibility
    decrement: store.decrement,
    reset: store.reset,
    setCount: store.setCount,
    store,
  }
}