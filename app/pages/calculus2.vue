<script setup lang="ts">
// app/pages/calculus2.vue
// ^ Interactive State Management & Pinia Inspector
// & Demonstrates the 3 paradigms of state in modern Vue 3 / Nuxt 4:
// & 1. Local ref() - component scoped
// & 2. useState() - SSR shared ref
// & 3. Pinia defineStore() - Centralized, structured, getters, actions & persistence

import { storeToRefs } from 'pinia'
import { useCalculatorStore } from '~/stores/calculator'
import { useCounterStore } from '~/stores/counter'
import { ArrowLeftIcon, SparklesIcon, CalculatorIcon } from '@heroicons/vue/20/solid'

// 1. Local ref (isolated to this component only)
const localClicks = ref(0)

// 2. Nuxt useState (shared in memory across pages, but without Pinia features)
const nuxtSharedVal = useState('demo-shared-val', () => 42)

// 3. Pinia Counter Store (Full structured state management)
const counterStore = useCounterStore()
const { count, doubleCount, isEven } = storeToRefs(counterStore)

// 4. Pinia Calculator Store (Shared calculator state)
const calcStore = useCalculatorStore()
const { expr, answer, lastAnswer, historyCount, angleMode, history } = storeToRefs(calcStore)

function testCalculateInStore() {
  calcStore.clearAll()
  calcStore.inputDigit('1')
  calcStore.inputDigit('2')
  calcStore.chooseOperator('×')
  calcStore.inputDigit('8')
  calcStore.equals()
}
</script>

<template>
  <main class="min-h-screen bg-neutral-950 p-4 sm:p-8 text-neutral-100 font-sans">
    <div class="mx-auto max-w-3xl space-y-8">
      <!-- ================= Header ================= -->
      <header class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <NuxtLink
            to="/"
            class="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition mb-2"
          >
            <ArrowLeftIcon class="size-3.5" />
            <span>Back to Calculator</span>
          </NuxtLink>
          <h1 class="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
            <span>State Management Lab</span>
            <span class="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-mono font-medium text-emerald-400">
              Pinia 🍍
            </span>
          </h1>
          <p class="mt-1 text-sm text-neutral-400">
            Compare <span class="text-neutral-200 font-mono">ref()</span>,
            <span class="text-neutral-200 font-mono">useState()</span>, and
            <span class="text-emerald-400 font-mono font-semibold">Pinia defineStore()</span> in real time.
          </p>
        </div>

        <button
          type="button"
          class="self-start sm:self-auto inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold hover:bg-white/10 transition"
          @click="testCalculateInStore"
        >
          <SparklesIcon class="size-4 text-amber-400" />
          <span>Dispatch Store Test (12×8)</span>
        </button>
      </header>

      <!-- ================= Live Comparison Grid ================= -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- 1. Local ref() -->
        <div class="rounded-2xl border border-white/10 bg-neutral-900/80 p-5 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-bold uppercase tracking-wider text-neutral-400">1. Local State</span>
              <span class="rounded bg-rose-500/15 px-2 py-0.5 font-mono text-[10px] font-semibold text-rose-400">
                ref()
              </span>
            </div>
            <p class="text-xs text-neutral-400">
              Scoped strictly to this component. Navigating away destroys this value completely.
            </p>
          </div>

          <div class="my-6 text-center">
            <span class="font-mono text-5xl font-black text-white tabular-nums">{{ localClicks }}</span>
            <span class="block text-[11px] text-neutral-500 mt-1">isolated clicks</span>
          </div>

          <button
            type="button"
            class="w-full rounded-xl bg-neutral-800 hover:bg-neutral-700 py-2 text-xs font-semibold text-white transition active:scale-95"
            @click="localClicks++"
          >
            Increment Local
          </button>
        </div>

        <!-- 2. Nuxt useState() -->
        <div class="rounded-2xl border border-white/10 bg-neutral-900/80 p-5 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-bold uppercase tracking-wider text-neutral-400">2. Shared Ref</span>
              <span class="rounded bg-sky-500/15 px-2 py-0.5 font-mono text-[10px] font-semibold text-sky-400">
                useState()
              </span>
            </div>
            <p class="text-xs text-neutral-400">
              SSR-friendly global ref shared across pages in memory, but lacks getters, actions, and persistence.
            </p>
          </div>

          <div class="my-6 text-center">
            <span class="font-mono text-5xl font-black text-sky-400 tabular-nums">{{ nuxtSharedVal }}</span>
            <span class="block text-[11px] text-neutral-500 mt-1">shared across routes</span>
          </div>

          <div class="flex gap-2">
            <button
              type="button"
              class="flex-1 rounded-xl bg-neutral-800 hover:bg-neutral-700 py-2 text-xs font-semibold text-white transition active:scale-95"
              @click="nuxtSharedVal--"
            >
              &minus; 1
            </button>
            <button
              type="button"
              class="flex-1 rounded-xl bg-sky-600 hover:bg-sky-500 py-2 text-xs font-semibold text-white transition active:scale-95"
              @click="nuxtSharedVal++"
            >
              + 1
            </button>
          </div>
        </div>

        <!-- 3. Pinia defineStore() -->
        <div class="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-5 flex flex-col justify-between ring-1 ring-emerald-500/20">
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-bold uppercase tracking-wider text-emerald-400">3. Pinia Store</span>
              <span class="rounded bg-emerald-500/20 px-2 py-0.5 font-mono text-[10px] font-semibold text-emerald-300">
                defineStore()
              </span>
            </div>
            <p class="text-xs text-emerald-200/70">
              Structured architecture: Reactive State, Computed Getters, Actions, and LocalStorage persistence.
            </p>
          </div>

          <div class="my-4 text-center">
            <span class="font-mono text-5xl font-black text-emerald-400 tabular-nums">{{ count }}</span>
            <div class="flex items-center justify-center gap-2 mt-1">
              <span class="text-[10px] font-mono text-emerald-300 bg-emerald-900/60 px-2 py-0.5 rounded">
                2x: {{ doubleCount }}
              </span>
              <span class="text-[10px] font-mono text-emerald-300 bg-emerald-900/60 px-2 py-0.5 rounded">
                {{ isEven ? 'Even' : 'Odd' }}
              </span>
            </div>
          </div>

          <div class="flex gap-2">
            <button
              type="button"
              class="flex-1 rounded-xl bg-neutral-800 hover:bg-neutral-700 py-2 text-xs font-semibold text-white transition active:scale-95"
              @click="counterStore.decrement"
            >
              &minus; Dec
            </button>
            <button
              type="button"
              class="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 py-2 text-xs font-semibold text-white transition active:scale-95"
              @click="counterStore.increment"
            >
              + Inc
            </button>
          </div>
        </div>
      </div>

      <!-- ================= Pinia Calculator Store Live Telemetry ================= -->
      <section class="rounded-3xl border border-white/10 bg-neutral-900/90 p-6 space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="size-2 rounded-full bg-emerald-400 animate-pulse" />
            <h2 class="text-base font-bold text-white">useCalculatorStore Telemetry</h2>
          </div>
          <span class="font-mono text-xs text-neutral-400">{{ historyCount }} calculations saved in Pinia</span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono text-xs">
          <div class="rounded-xl bg-black/40 p-3 border border-white/5">
            <span class="text-neutral-500 block text-[10px]">CURRENT EXPR</span>
            <span class="text-emerald-300 font-bold text-sm truncate block">{{ expr || '— (empty)' }}</span>
          </div>
          <div class="rounded-xl bg-black/40 p-3 border border-white/5">
            <span class="text-neutral-500 block text-[10px]">LAST RESULT</span>
            <span class="text-cyan-300 font-bold text-sm truncate block">{{ answer || '—' }}</span>
          </div>
          <div class="rounded-xl bg-black/40 p-3 border border-white/5">
            <span class="text-neutral-500 block text-[10px]">MEMORY (Ans)</span>
            <span class="text-amber-300 font-bold text-sm truncate block">{{ lastAnswer }}</span>
          </div>
          <div class="rounded-xl bg-black/40 p-3 border border-white/5">
            <span class="text-neutral-500 block text-[10px]">ANGLE MODE</span>
            <span class="text-emerald-400 font-bold text-sm truncate block">{{ angleMode }}</span>
          </div>
          <div class="rounded-xl bg-black/40 p-3 border border-white/5">
            <span class="text-neutral-500 block text-[10px]">HISTORY ITEMS</span>
            <span class="text-purple-300 font-bold text-sm truncate block">{{ historyCount }} items</span>
          </div>
        </div>

        <!-- Recent Calculation Log -->
        <div>
          <span class="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-2">Saved History in Store</span>
          <div class="max-h-40 overflow-y-auto space-y-1 font-mono text-xs">
            <div
              v-for="(item, i) in history.slice(0, 5)"
              :key="i"
              class="flex items-center justify-between rounded-lg bg-white/5 px-3 py-1.5"
            >
              <div class="flex items-center gap-2">
                <CalculatorIcon class="size-3.5 text-emerald-400" />
                <span class="text-neutral-300">{{ item.shown }}</span>
                <span class="text-emerald-300 font-semibold">= {{ item.result }}</span>
              </div>
              <span class="text-[10px] text-neutral-500">{{ item.timestamp }}</span>
            </div>
            <p v-if="history.length === 0" class="text-xs text-neutral-500 italic py-2">
              No calculations saved yet. Return to the calculator to compute some sums!
            </p>
          </div>
        </div>
      </section>

      <!-- ================= Comparison Guide Table ================= -->
      <section class="rounded-3xl border border-white/10 bg-neutral-900/60 p-6">
        <h2 class="text-base font-bold text-white mb-4">When to Use Which?</h2>
        <div class="overflow-x-auto text-xs">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-white/10 text-neutral-400 uppercase tracking-wider font-mono">
                <th class="py-2.5 px-3">State Mechanism</th>
                <th class="py-2.5 px-3">Scope</th>
                <th class="py-2.5 px-3">Lifecycle</th>
                <th class="py-2.5 px-3">Getters & Actions</th>
                <th class="py-2.5 px-3">Best Use Case</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5 font-sans">
              <tr>
                <td class="py-3 px-3 font-mono font-bold text-rose-400">ref()</td>
                <td class="py-3 px-3 text-neutral-300">Local component</td>
                <td class="py-3 px-3 text-neutral-400">Destroyed on unmount</td>
                <td class="py-3 px-3 text-neutral-400">Manual (local computed)</td>
                <td class="py-3 px-3 text-neutral-300">Temporary modals, toggles, form drafts</td>
              </tr>
              <tr>
                <td class="py-3 px-3 font-mono font-bold text-sky-400">useState()</td>
                <td class="py-3 px-3 text-neutral-300">Nuxt app-wide</td>
                <td class="py-3 px-3 text-neutral-400">Survives page changes in memory</td>
                <td class="py-3 px-3 text-neutral-400">None (plain ref)</td>
                <td class="py-3 px-3 text-neutral-300">Simple shared values, SSR hydration values</td>
              </tr>
              <tr class="bg-emerald-500/5">
                <td class="py-3 px-3 font-mono font-bold text-emerald-400">Pinia defineStore()</td>
                <td class="py-3 px-3 text-neutral-300">Global application</td>
                <td class="py-3 px-3 text-neutral-400">Persistent across app + LocalStorage</td>
                <td class="py-3 px-3 text-emerald-300 font-semibold">Native Getters & Actions</td>
                <td class="py-3 px-3 text-neutral-300">Complex domain logic, calculator, carts, user sessions</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </main>
</template>
