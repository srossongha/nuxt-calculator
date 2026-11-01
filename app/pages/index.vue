<script setup lang="ts">
// app/pages/index.vue
// ^ Scientific Calculator powered by Pinia State Management
// & State, Getters, and Actions are managed centrally in `app/stores/calculator.ts`

import { storeToRefs } from 'pinia'
import { useCalculatorStore } from '~/stores/calculator'
import { Popover, PopoverButton, PopoverPanel, Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import {
  ChevronDownIcon,
  ArrowPathIcon,
  BeakerIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  ClipboardDocumentIcon,
  ClipboardDocumentCheckIcon,
  QuestionMarkCircleIcon,
  SwatchIcon,
  BackspaceIcon,
  TrashIcon,
  CodeBracketIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  ChevronDownIcon as ChevronDownSmallIcon
} from '@heroicons/vue/20/solid'

// Initialize the Pinia store
const calcStore = useCalculatorStore()

// State and getters via storeToRefs or direct store access
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
  displayParts,
  hasExpression,
  historyCount,
} = storeToRefs(calcStore)

// Actions
const {
  inputDigit,
  inputDot,
  inputSqrt,
  inputNthRoot,
  inputAns,
  chooseOperator,
  backspace,
  moveCursor,
  equals,
  restoreHistory,
  clearHistory,
  clearAll,
  toggleSound,
  setTheme,
  copyToClipboard,
} = calcStore

// Local UI state
const isHelpOpen = ref(false)
const isLiveStateOpen = ref(false)
const exprContainerRef = ref<HTMLElement | null>(null)

// Auto-scroll expression container to cursor when typing
watch(cursor, () => {
  nextTick(() => {
    if (exprContainerRef.value) {
      exprContainerRef.value.scrollLeft = exprContainerRef.value.scrollWidth
    }
  })
})

// Full keyboard navigation support
function handleKeydown(event: KeyboardEvent) {
  // If dialog is open or user is typing into an input, don't intercept
  if (isHelpOpen.value) {
    if (event.key === 'Escape') isHelpOpen.value = false
    return
  }

  const key = event.key

  if (/^[0-9]$/.test(key)) {
    event.preventDefault()
    inputDigit(key)
  } else if (key === '.' || key === ',') {
    event.preventDefault()
    inputDot()
  } else if (key === '+') {
    event.preventDefault()
    chooseOperator('+')
  } else if (key === '-') {
    event.preventDefault()
    chooseOperator('-')
  } else if (key === '*' || key.toLowerCase() === 'x') {
    event.preventDefault()
    chooseOperator('×')
  } else if (key === '/') {
    event.preventDefault()
    chooseOperator('÷')
  } else if (key === '^') {
    event.preventDefault()
    chooseOperator('^')
  } else if (key.toLowerCase() === 'r') {
    event.preventDefault()
    inputSqrt()
  } else if (key.toLowerCase() === 'a') {
    event.preventDefault()
    inputAns()
  } else if (key === 'Enter' || key === '=') {
    event.preventDefault()
    equals()
  } else if (key === 'Backspace') {
    event.preventDefault()
    backspace()
  } else if (key === 'Escape' || key === 'Delete') {
    event.preventDefault()
    clearAll()
  } else if (key === 'ArrowLeft') {
    event.preventDefault()
    moveCursor('left')
  } else if (key === 'ArrowRight') {
    event.preventDefault()
    moveCursor('right')
  } else if (key === 'Home') {
    event.preventDefault()
    moveCursor('start')
  } else if (key === 'End') {
    event.preventDefault()
    moveCursor('end')
  } else if (key === '?') {
    event.preventDefault()
    isHelpOpen.value = true
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

// Theme configuration styles
const themeClasses = computed(() => {
  switch (theme.value) {
    case 'cyberpunk':
      return {
        bg: 'bg-gradient-to-br from-slate-950 via-purple-950 to-neutral-950 text-pink-50',
        card: 'bg-neutral-900/95 border-fuchsia-500/30 shadow-[0_0_50px_-10px_rgba(217,70,239,0.3)]',
        screen: 'bg-neutral-950 border-fuchsia-500/40 text-fuchsia-300 shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)]',
        screenAns: 'text-cyan-300 text-shadow-neon',
        numKey: 'bg-neutral-800/80 hover:bg-neutral-700/80 text-white border-neutral-700/50',
        opKey: 'bg-fuchsia-600 hover:bg-fuchsia-500 text-white shadow-[0_0_15px_-3px_rgba(217,70,239,0.5)]',
        sciKey: 'bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border-cyan-800/40',
        eqKey: 'bg-gradient-to-r from-pink-500 to-cyan-500 hover:opacity-90 text-white font-bold shadow-[0_0_20px_rgba(6,182,212,0.4)]',
        clearKey: 'bg-rose-950/80 hover:bg-rose-900/80 text-rose-300 border-rose-800/40',
        badge: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30',
        accentText: 'text-cyan-400',
      }
    case 'retro-amber':
      return {
        bg: 'bg-stone-950 text-amber-50',
        card: 'bg-stone-900 border-stone-800 shadow-[0_0_40px_-5px_rgba(245,158,11,0.2)]',
        screen: 'bg-[#1e1708] border-amber-900/60 text-amber-500/90 shadow-[inset_0_2px_10px_rgba(0,0,0,0.9)]',
        screenAns: 'text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]',
        numKey: 'bg-stone-800 hover:bg-stone-700 text-amber-100 border-stone-700/60',
        opKey: 'bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold',
        sciKey: 'bg-stone-800/80 hover:bg-stone-700/80 text-amber-400 border-stone-700/60',
        eqKey: 'bg-amber-500 hover:bg-amber-400 text-stone-950 font-black shadow-[0_0_15px_rgba(245,158,11,0.4)]',
        clearKey: 'bg-red-950 hover:bg-red-900 text-red-200 border-red-800/50',
        badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        accentText: 'text-amber-400',
      }
    case 'slate':
      return {
        bg: 'bg-gradient-to-b from-slate-900 via-slate-950 to-neutral-950 text-slate-100',
        card: 'bg-slate-900/90 border-slate-700/40 shadow-2xl shadow-slate-950',
        screen: 'bg-slate-950 border-slate-700/60 text-slate-300 shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)]',
        screenAns: 'text-sky-300 font-semibold',
        numKey: 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700/40',
        opKey: 'bg-sky-600 hover:bg-sky-500 text-white',
        sciKey: 'bg-slate-800/60 hover:bg-slate-700/60 text-sky-400 border-slate-700/40',
        eqKey: 'bg-sky-500 hover:bg-sky-400 text-white font-bold shadow-[0_0_15px_rgba(14,165,233,0.3)]',
        clearKey: 'bg-rose-900/60 hover:bg-rose-800/60 text-rose-200 border-rose-800/40',
        badge: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
        accentText: 'text-sky-400',
      }
    case 'obsidian':
    default:
      return {
        bg: 'bg-neutral-950 text-neutral-100',
        card: 'bg-neutral-900/95 border-neutral-800 shadow-[0_0_50px_-10px_rgba(0,0,0,0.8)] ring-1 ring-white/10',
        screen: 'bg-[#0f1411] border-neutral-800 text-emerald-400/90 shadow-[inset_0_2px_12px_rgba(0,0,0,0.9)]',
        screenAns: 'text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.4)]',
        numKey: 'bg-neutral-800 hover:bg-neutral-700 text-neutral-100 border-neutral-700/50',
        opKey: 'bg-emerald-600 hover:bg-emerald-500 text-white font-semibold',
        sciKey: 'bg-neutral-800/60 hover:bg-neutral-700/60 text-emerald-400 border-neutral-700/40',
        eqKey: 'bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black shadow-[0_0_20px_rgba(16,185,129,0.3)]',
        clearKey: 'bg-red-950/70 hover:bg-red-900/70 text-red-200 border-red-800/50',
        badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
        accentText: 'text-emerald-400',
      }
  }
})
</script>

<template>
  <main
    :class="[
      themeClasses.bg,
      'relative flex min-h-screen flex-col items-center justify-between p-3 sm:p-6 transition-colors duration-300 overflow-x-hidden font-sans'
    ]"
  >
    <!-- Background atmospheric glow -->
    <div class="pointer-events-none absolute inset-0 overflow-hidden opacity-30">
      <div class="absolute -top-40 left-1/2 h-[35rem] w-[35rem] -translate-x-1/2 rounded-full bg-emerald-500/20 blur-[120px]" />
      <div class="absolute -bottom-40 right-10 h-[25rem] w-[25rem] rounded-full bg-amber-500/10 blur-[100px]" />
    </div>

    <!-- ================= Top Navigation Bar ================= -->
    <header class="relative z-20 flex w-full max-w-md items-center justify-between pb-3">
      <!-- Brand & State Badge -->
      <div class="flex items-center gap-2">
        <div class="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold backdrop-blur border" :class="themeClasses.badge">
          <span class="relative flex h-2 w-2">
            <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-75" />
            <span class="relative inline-flex h-2 w-2 rounded-full bg-current" />
          </span>
          <span>Pinia State</span>
        </div>

        <!-- Sound toggle -->
        <button
          type="button"
          class="rounded-full p-1.5 text-neutral-400 transition hover:bg-white/10 hover:text-white"
          :title="soundEnabled ? 'Mute audio clicks' : 'Enable audio clicks'"
          @click="toggleSound"
        >
          <SpeakerWaveIcon v-if="soundEnabled" class="size-4" />
          <SpeakerXMarkIcon v-else class="size-4 text-neutral-500" />
        </button>

        <!-- Theme Switcher Menu -->
        <Popover class="relative">
          <PopoverButton
            class="rounded-full p-1.5 text-neutral-400 transition hover:bg-white/10 hover:text-white"
            title="Change Theme"
          >
            <SwatchIcon class="size-4" />
          </PopoverButton>
          <transition
            enter-active-class="transition duration-150 ease-out"
            enter-from-class="scale-95 opacity-0"
            enter-to-class="scale-100 opacity-100"
            leave-active-class="transition duration-100 ease-in"
            leave-from-class="scale-100 opacity-100"
            leave-to-class="scale-95 opacity-0"
          >
            <PopoverPanel class="absolute left-0 mt-2 z-30 w-36 rounded-xl border border-white/10 bg-neutral-900/95 p-1 text-xs shadow-xl backdrop-blur">
              <button
                v-for="t in [
                  { id: 'obsidian', label: 'Obsidian OLED' },
                  { id: 'cyberpunk', label: 'Cyberpunk Neon' },
                  { id: 'retro-amber', label: 'Retro Amber' },
                  { id: 'slate', label: 'Clean Slate' }
                ]"
                :key="t.id"
                type="button"
                :class="[
                  'flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 transition',
                  theme === t.id ? 'bg-white/15 font-semibold text-white' : 'text-neutral-400 hover:bg-white/5 hover:text-neutral-200'
                ]"
                @click="setTheme(t.id as any)"
              >
                <span>{{ t.label }}</span>
                <span v-if="theme === t.id" class="size-1.5 rounded-full bg-current" />
              </button>
            </PopoverPanel>
          </transition>
        </Popover>
      </div>

      <!-- Right controls: Keyboard Help, History Popover, State Inspector -->
      <div class="flex items-center gap-1.5 sm:gap-2">
        <!-- Keyboard shortcuts modal trigger -->
        <button
          type="button"
          class="rounded-full p-1.5 text-neutral-400 transition hover:bg-white/10 hover:text-white"
          title="Keyboard shortcuts (?)"
          @click="isHelpOpen = true"
        >
          <QuestionMarkCircleIcon class="size-4" />
        </button>

        <!-- History Popover -->
        <Popover class="relative">
          <PopoverButton
            class="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-neutral-200 backdrop-blur transition hover:bg-white/15 hover:text-white"
          >
            <span>History</span>
            <span
              v-if="historyCount > 0"
              class="flex h-4 min-w-4 items-center justify-center rounded-full bg-white/20 px-1 text-[10px]"
            >
              {{ historyCount }}
            </span>
            <ChevronDownIcon class="size-3.5 opacity-70" />
          </PopoverButton>

          <transition
            enter-active-class="transition duration-150 ease-out"
            enter-from-class="translate-y-1 opacity-0"
            enter-to-class="translate-y-0 opacity-100"
            leave-active-class="transition duration-100 ease-in"
            leave-from-class="translate-y-0 opacity-100"
            leave-to-class="translate-y-1 opacity-0"
          >
            <PopoverPanel class="absolute right-0 z-30 mt-2 w-80 max-w-[90vw] overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/95 shadow-2xl backdrop-blur">
              <div class="flex items-center justify-between border-b border-white/10 px-3.5 py-2.5">
                <span class="text-xs font-semibold uppercase tracking-wider text-neutral-400">Calculation Log</span>
                <button
                  v-if="history.length > 0"
                  type="button"
                  class="inline-flex items-center gap-1 text-[11px] text-red-400 hover:text-red-300"
                  @click="clearHistory"
                >
                  <TrashIcon class="size-3" />
                  <span>Clear All</span>
                </button>
              </div>

              <div class="max-h-64 overflow-y-auto p-2 divide-y divide-white/5">
                <div v-if="history.length === 0" class="py-8 text-center text-xs text-neutral-500">
                  No previous calculations recorded
                </div>

                <div
                  v-for="(item, i) in history"
                  :key="i"
                  class="group flex flex-col rounded-lg p-2 transition hover:bg-white/5 text-right font-mono"
                >
                  <div class="flex items-center justify-between">
                    <button
                      type="button"
                      class="text-[10px] text-neutral-500 hover:text-neutral-300 opacity-0 group-hover:opacity-100 transition"
                      title="Copy result"
                      @click="copyToClipboard(item.result)"
                    >
                      <ClipboardDocumentIcon class="size-3.5" />
                    </button>
                    <span class="truncate text-xs text-neutral-400">{{ item.shown }}</span>
                  </div>
                  <button
                    type="button"
                    class="mt-0.5 truncate text-sm font-semibold text-white hover:underline text-right"
                    title="Load back into calculator"
                    @click="restoreHistory(item.raw)"
                  >
                    = {{ item.result }}
                  </button>
                </div>
              </div>
            </PopoverPanel>
          </transition>
        </Popover>

        <!-- Inspector Link -->
        <NuxtLink
          to="/calculus2"
          class="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-300 backdrop-blur transition hover:bg-emerald-500/20"
        >
          <BeakerIcon class="size-3.5" />
          <span class="hidden sm:inline">Inspector</span>
        </NuxtLink>
      </div>
    </header>

    <!-- ================= Main Calculator Body ================= -->
    <div class="relative z-10 w-full max-w-sm flex-1 flex flex-col justify-center">
      <section
        :class="[
          themeClasses.card,
          'rounded-3xl p-4 sm:p-5 border backdrop-blur-xl transition-all duration-300'
        ]"
      >
        <!-- Calculator Top Bezel info -->
        <div class="mb-3 flex items-center justify-between px-1 text-[11px] font-mono tracking-wider text-neutral-500">
          <span class="flex items-center gap-1 font-semibold">
            <span>PINIA·FX</span>
            <span class="text-[9px] opacity-70">SCI-991</span>
          </span>
          <div class="flex items-center gap-2">
            <span v-if="lastAnswer !== 0" class="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-amber-400">
              ANS: {{ lastAnswer }}
            </span>
            <span class="rounded bg-white/5 px-1 py-0.5 text-[10px]">DEG</span>
          </div>
        </div>

        <!-- ================= Screen / Display ================= -->
        <div
          :class="[
            themeClasses.screen,
            'relative mb-4 flex flex-col justify-between rounded-2xl border p-3.5 font-mono select-none overflow-hidden min-h-[108px]'
          ]"
        >
          <!-- Display header with status and copy button -->
          <div class="flex items-center justify-between text-[11px] text-neutral-500 mb-1">
            <div class="flex items-center gap-2">
              <span class="text-[10px] tracking-widest uppercase">EXPR</span>
              <span v-if="expr" class="text-[10px] opacity-60">L:{{ expr.length }}</span>
            </div>
            <!-- Click to Copy button -->
            <button
              type="button"
              class="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] transition hover:bg-white/10 hover:text-neutral-200"
              :title="isCopied ? 'Copied to clipboard!' : 'Copy result'"
              @click="copyToClipboard()"
            >
              <ClipboardDocumentCheckIcon v-if="isCopied" class="size-3.5 text-emerald-400" />
              <ClipboardDocumentIcon v-else class="size-3.5" />
              <span>{{ isCopied ? 'Copied!' : 'Copy' }}</span>
            </button>
          </div>

          <!-- The Expression Line with Cursor -->
          <div
            ref="exprContainerRef"
            class="no-scrollbar overflow-x-auto whitespace-nowrap text-left text-xl sm:text-2xl tracking-wide py-1"
          >
            <!-- Resting state when expression is empty -->
            <template v-if="expr === ''">
              <span class="opacity-40">0</span>
              <span class="animate-pulse font-bold text-current">|</span>
            </template>

            <!-- Render formatted runs with proper root bars and power superscripts -->
            <span
              v-for="(part, i) in displayParts"
              :key="i"
              :class="part.bar ? 'border-t-2 border-current pt-0.5' : ''"
              :style="part.level > 0
                ? { fontSize: `${Math.pow(0.72, part.level)}em`, verticalAlign: 'super' }
                : {}"
            ><!--
              Jammed tags ensure no synthetic spaces in inline math display
            --><template v-for="(chunk, j) in part.chunks" :key="j"
              ><span v-if="j > 0" class="animate-pulse font-bold text-current drop-shadow-[0_0_4px_currentColor]">|</span>{{ chunk }}</template
            ></span>
          </div>

          <!-- Answer Line -->
          <div class="mt-1 flex items-baseline justify-end text-right">
            <span
              :class="[
                themeClasses.screenAns,
                'text-2xl sm:text-3xl font-bold tracking-tight truncate cursor-pointer transition'
              ]"
              :title="answer ? 'Click to copy answer' : undefined"
              @click="answer && copyToClipboard(answer)"
            >
              {{ answer ? `= ${answer}` : '&nbsp;' }}
            </span>
          </div>
        </div>

        <!-- ================= Navigation D-Pad & Quick Controls ================= -->
        <div class="mb-3 flex items-center justify-between gap-2 px-1">
          <!-- Clear and Backspace buttons -->
          <div class="flex items-center gap-1.5">
            <button
              type="button"
              :class="[
                themeClasses.clearKey,
                'btn-press flex h-9 items-center justify-center rounded-xl border px-3 text-xs font-bold tracking-wider transition'
              ]"
              title="All Clear (Escape)"
              @click="clearAll"
            >
              AC
            </button>
            <button
              type="button"
              :class="[
                themeClasses.clearKey,
                'btn-press flex h-9 items-center justify-center rounded-xl border px-2.5 text-xs font-bold transition'
              ]"
              title="Delete last character (Backspace)"
              @click="backspace"
            >
              <BackspaceIcon class="size-4" />
            </button>
          </div>

          <!-- Precision D-Pad Cursor disc -->
          <div class="relative flex h-14 w-24 items-center justify-center rounded-full bg-neutral-950/80 p-1 border border-white/10 shadow-inner">
            <div class="grid grid-cols-3 grid-rows-3 h-full w-full">
              <!-- Jump to Start -->
              <button
                type="button"
                class="col-start-2 row-start-1 flex items-center justify-center rounded-t-full text-neutral-400 hover:text-white transition active:scale-90"
                title="Jump to Start (Home)"
                @click="moveCursor('start')"
              >
                <ChevronUpIcon class="size-3.5" />
              </button>

              <!-- Step Left -->
              <button
                type="button"
                class="col-start-1 row-start-2 flex items-center justify-center rounded-l-full text-neutral-400 hover:text-white transition active:scale-90"
                title="Cursor Left (←)"
                @click="moveCursor('left')"
              >
                <ChevronLeftIcon class="size-3.5" />
              </button>

              <!-- Center Disc Jewel -->
              <div class="col-start-2 row-start-2 flex items-center justify-center">
                <div class="size-2 rounded-full bg-neutral-700/80 ring-1 ring-white/20" />
              </div>

              <!-- Step Right -->
              <button
                type="button"
                class="col-start-3 row-start-2 flex items-center justify-center rounded-r-full text-neutral-400 hover:text-white transition active:scale-90"
                title="Cursor Right (→)"
                @click="moveCursor('right')"
              >
                <ChevronRightIcon class="size-3.5" />
              </button>

              <!-- Jump to End -->
              <button
                type="button"
                class="col-start-2 row-start-3 flex items-center justify-center rounded-b-full text-neutral-400 hover:text-white transition active:scale-90"
                title="Jump to End (End)"
                @click="moveCursor('end')"
              >
                <ChevronDownSmallIcon class="size-3.5" />
              </button>
            </div>
          </div>

          <!-- Answer memory shortcut button -->
          <div class="flex items-center">
            <button
              type="button"
              :class="[
                themeClasses.sciKey,
                'btn-press flex h-9 items-center justify-center rounded-xl border px-3 text-xs font-bold font-mono tracking-wider transition'
              ]"
              title="Insert Last Answer (Ans)"
              @click="inputAns"
            >
              Ans
            </button>
          </div>
        </div>

        <!-- ================= Scientific Function Row ================= -->
        <div class="mb-2 grid grid-cols-4 gap-2">
          <button
            type="button"
            :class="[
              themeClasses.sciKey,
              'btn-press flex h-11 items-center justify-center rounded-2xl border text-sm font-semibold transition'
            ]"
            title="Square Root (√)"
            @click="inputSqrt"
          >
            &radic;x
          </button>

          <button
            type="button"
            :class="[
              themeClasses.sciKey,
              'btn-press flex h-11 items-center justify-center rounded-2xl border text-sm font-semibold transition'
            ]"
            title="Power exponent (^)"
            @click="chooseOperator('^')"
          >
            x<sup class="text-[0.75em]">y</sup>
          </button>

          <button
            type="button"
            :class="[
              themeClasses.sciKey,
              'btn-press flex h-11 items-center justify-center rounded-2xl border text-sm font-semibold transition'
            ]"
            title="Nth Root (ⁿ√)"
            @click="inputNthRoot"
          >
            <sup class="text-[0.75em]">y</sup>&radic;x
          </button>

          <button
            type="button"
            :class="[
              themeClasses.opKey,
              'btn-press flex h-11 items-center justify-center rounded-2xl text-lg font-bold transition'
            ]"
            title="Divide (/)"
            @click="chooseOperator('÷')"
          >
            &divide;
          </button>
        </div>

        <!-- ================= Main Keypad Grid (Numbers & Operators) ================= -->
        <div class="grid grid-cols-4 gap-2">
          <!-- Row 1: 7, 8, 9, × -->
          <button
            type="button"
            :class="[
              themeClasses.numKey,
              'btn-press flex aspect-[1.15/1] items-center justify-center rounded-2xl border text-xl font-medium transition'
            ]"
            @click="inputDigit('7')"
          >7</button>
          <button
            type="button"
            :class="[
              themeClasses.numKey,
              'btn-press flex aspect-[1.15/1] items-center justify-center rounded-2xl border text-xl font-medium transition'
            ]"
            @click="inputDigit('8')"
          >8</button>
          <button
            type="button"
            :class="[
              themeClasses.numKey,
              'btn-press flex aspect-[1.15/1] items-center justify-center rounded-2xl border text-xl font-medium transition'
            ]"
            @click="inputDigit('9')"
          >9</button>
          <button
            type="button"
            :class="[
              themeClasses.opKey,
              'btn-press flex aspect-[1.15/1] items-center justify-center rounded-2xl text-xl font-bold transition'
            ]"
            title="Multiply (*)"
            @click="chooseOperator('×')"
          >&times;</button>

          <!-- Row 2: 4, 5, 6, - -->
          <button
            type="button"
            :class="[
              themeClasses.numKey,
              'btn-press flex aspect-[1.15/1] items-center justify-center rounded-2xl border text-xl font-medium transition'
            ]"
            @click="inputDigit('4')"
          >4</button>
          <button
            type="button"
            :class="[
              themeClasses.numKey,
              'btn-press flex aspect-[1.15/1] items-center justify-center rounded-2xl border text-xl font-medium transition'
            ]"
            @click="inputDigit('5')"
          >5</button>
          <button
            type="button"
            :class="[
              themeClasses.numKey,
              'btn-press flex aspect-[1.15/1] items-center justify-center rounded-2xl border text-xl font-medium transition'
            ]"
            @click="inputDigit('6')"
          >6</button>
          <button
            type="button"
            :class="[
              themeClasses.opKey,
              'btn-press flex aspect-[1.15/1] items-center justify-center rounded-2xl text-xl font-bold transition'
            ]"
            title="Subtract (-)"
            @click="chooseOperator('-')"
          >&minus;</button>

          <!-- Row 3: 1, 2, 3, + -->
          <button
            type="button"
            :class="[
              themeClasses.numKey,
              'btn-press flex aspect-[1.15/1] items-center justify-center rounded-2xl border text-xl font-medium transition'
            ]"
            @click="inputDigit('1')"
          >1</button>
          <button
            type="button"
            :class="[
              themeClasses.numKey,
              'btn-press flex aspect-[1.15/1] items-center justify-center rounded-2xl border text-xl font-medium transition'
            ]"
            @click="inputDigit('2')"
          >2</button>
          <button
            type="button"
            :class="[
              themeClasses.numKey,
              'btn-press flex aspect-[1.15/1] items-center justify-center rounded-2xl border text-xl font-medium transition'
            ]"
            @click="inputDigit('3')"
          >3</button>
          <button
            type="button"
            :class="[
              themeClasses.opKey,
              'btn-press flex aspect-[1.15/1] items-center justify-center rounded-2xl text-xl font-bold transition'
            ]"
            title="Add (+)"
            @click="chooseOperator('+')"
          >+</button>

          <!-- Row 4: 0, ., C, = -->
          <button
            type="button"
            :class="[
              themeClasses.numKey,
              'btn-press flex aspect-[1.15/1] items-center justify-center rounded-2xl border text-xl font-medium transition'
            ]"
            @click="inputDigit('0')"
          >0</button>
          <button
            type="button"
            :class="[
              themeClasses.numKey,
              'btn-press flex aspect-[1.15/1] items-center justify-center rounded-2xl border text-xl font-medium transition'
            ]"
            @click="inputDot"
          >.</button>
          <button
            type="button"
            :class="[
              themeClasses.sciKey,
              'btn-press flex aspect-[1.15/1] items-center justify-center rounded-2xl border text-xs font-bold tracking-wider transition'
            ]"
            title="Clear line"
            @click="clearAll"
          >
            CLR
          </button>
          <button
            type="button"
            :class="[
              themeClasses.eqKey,
              'btn-press flex aspect-[1.15/1] items-center justify-center rounded-2xl text-2xl font-black transition'
            ]"
            title="Calculate (= or Enter)"
            @click="equals"
          >=</button>
        </div>
      </section>
    </div>

    <!-- ================= Bottom State Management Live Stream ================= -->
    <footer class="relative z-20 mt-3 w-full max-w-md">
      <div class="overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/80 backdrop-blur-md">
        <button
          type="button"
          class="flex w-full items-center justify-between px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white transition"
          @click="isLiveStateOpen = !isLiveStateOpen"
        >
          <div class="flex items-center gap-2">
            <CodeBracketIcon class="size-4 text-emerald-400" />
            <span>Pinia Store Live Debugger</span>
            <span class="rounded bg-emerald-500/20 px-1.5 py-0.2 text-[10px] text-emerald-400">
              {{ actionLogs.length }} actions
            </span>
          </div>
          <ChevronDownIcon
            :class="['size-4 transition-transform duration-200', isLiveStateOpen ? 'rotate-180' : '']"
          />
        </button>

        <div v-show="isLiveStateOpen" class="border-t border-white/10 p-3 text-xs font-mono space-y-2">
          <!-- Live Store State Snapshot -->
          <div class="grid grid-cols-2 gap-2 text-[11px] bg-black/40 p-2 rounded-lg">
            <div>
              <span class="text-neutral-500">expr:</span>
              <span class="text-emerald-300 ml-1 font-semibold">"{{ expr }}"</span>
            </div>
            <div>
              <span class="text-neutral-500">cursor:</span>
              <span class="text-amber-300 ml-1">{{ cursor }}</span>
            </div>
            <div>
              <span class="text-neutral-500">answer:</span>
              <span class="text-cyan-300 ml-1">{{ answer ?? 'null' }}</span>
            </div>
            <div>
              <span class="text-neutral-500">lastAnswer:</span>
              <span class="text-pink-300 ml-1">{{ lastAnswer }}</span>
            </div>
          </div>

          <!-- Real-time Dispatched Action Logs -->
          <div>
            <div class="text-[10px] uppercase tracking-wider text-neutral-500 mb-1">Recent Action Stream:</div>
            <div class="max-h-24 overflow-y-auto space-y-1">
              <div
                v-for="log in actionLogs.slice(0, 5)"
                :key="log.id"
                class="flex items-center justify-between text-[11px] bg-white/5 px-2 py-0.5 rounded"
              >
                <span class="text-emerald-400 font-semibold">{{ log.name }}</span>
                <span v-if="log.payload !== undefined" class="text-neutral-300 truncate max-w-[120px]">
                  ({{ log.payload }})
                </span>
                <span class="text-neutral-500 text-[10px]">{{ log.timestamp }}</span>
              </div>
              <p v-if="actionLogs.length === 0" class="text-neutral-500 text-[10px] italic">
                Press any button or type on keyboard to see actions stream in real time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>

    <!-- ================= Keyboard Shortcuts Modal ================= -->
    <TransitionRoot appear :show="isHelpOpen" as="template">
      <Dialog as="div" class="relative z-50" @close="isHelpOpen = false">
        <TransitionChild
          as="template"
          enter="duration-200 ease-out"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="duration-150 ease-in"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black/75 backdrop-blur-sm" />
        </TransitionChild>

        <div class="fixed inset-0 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              as="template"
              enter="duration-200 ease-out"
              enter-from="opacity-0 scale-95"
              enter-to="opacity-100 scale-100"
              leave="duration-150 ease-in"
              leave-from="opacity-100 scale-100"
              leave-to="opacity-0 scale-95"
            >
              <DialogPanel class="w-full max-w-sm rounded-3xl border border-white/10 bg-neutral-900 p-6 text-white shadow-2xl">
                <DialogTitle class="flex items-center justify-between text-lg font-bold">
                  <span>Keyboard Shortcuts</span>
                  <span class="rounded bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-400">Quick Guide</span>
                </DialogTitle>

                <div class="mt-4 space-y-2 text-xs font-mono">
                  <div class="flex justify-between py-1 border-b border-white/10">
                    <span class="text-neutral-400">Numbers & Decimal</span>
                    <span class="text-white font-bold">0 - 9, .</span>
                  </div>
                  <div class="flex justify-between py-1 border-b border-white/10">
                    <span class="text-neutral-400">Operators</span>
                    <span class="text-white font-bold">+ - * / ^</span>
                  </div>
                  <div class="flex justify-between py-1 border-b border-white/10">
                    <span class="text-neutral-400">Calculate</span>
                    <span class="text-white font-bold">Enter or =</span>
                  </div>
                  <div class="flex justify-between py-1 border-b border-white/10">
                    <span class="text-neutral-400">Backspace (Delete char)</span>
                    <span class="text-white font-bold">Backspace</span>
                  </div>
                  <div class="flex justify-between py-1 border-b border-white/10">
                    <span class="text-neutral-400">Clear All</span>
                    <span class="text-white font-bold">Escape or Del</span>
                  </div>
                  <div class="flex justify-between py-1 border-b border-white/10">
                    <span class="text-neutral-400">Square Root</span>
                    <span class="text-white font-bold">R</span>
                  </div>
                  <div class="flex justify-between py-1 border-b border-white/10">
                    <span class="text-neutral-400">Ans (Previous Result)</span>
                    <span class="text-white font-bold">A</span>
                  </div>
                  <div class="flex justify-between py-1">
                    <span class="text-neutral-400">Move Cursor</span>
                    <span class="text-white font-bold">&larr; &rarr; Home End</span>
                  </div>
                </div>

                <div class="mt-6">
                  <button
                    type="button"
                    class="w-full rounded-xl bg-white/10 py-2.5 text-xs font-semibold text-white hover:bg-white/20 transition"
                    @click="isHelpOpen = false"
                  >
                    Got it!
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
  </main>
</template>
