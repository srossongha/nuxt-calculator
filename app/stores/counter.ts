import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', () => {
  // State
  const count = ref(0)

  // Getters
  const doubleCount = computed(() => count.value * 2)
  const isEven = computed(() => count.value % 2 === 0)

  // Actions
  function increment() {
    count.value++
    saveToStorage()
  }

  function decrement() {
    if (count.value > 0) {
      count.value--
      saveToStorage()
    }
  }

  function reset() {
    count.value = 0
    saveToStorage()
  }

  function setCount(val: number) {
    count.value = val
    saveToStorage()
  }

  function saveToStorage() {
    if (import.meta.client) {
      try {
        localStorage.setItem('counter-store', String(count.value))
      } catch {
        // storage disabled
      }
    }
  }

  function loadFromStorage() {
    if (import.meta.client) {
      try {
        const saved = localStorage.getItem('counter-store')
        if (saved !== null && Number.isFinite(Number(saved))) {
          count.value = Number(saved)
        }
      } catch {
        // ignore
      }
    }
  }

  if (import.meta.client) {
    loadFromStorage()
  }

  return {
    count,
    doubleCount,
    isEven,
    increment,
    decrement,
    reset,
    setCount,
  }
})

