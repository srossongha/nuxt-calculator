<script setup lang="ts">
// app/pages/index.vue
// ^ Clean Scientific Calculator powered by Pinia State Management
// & State, Getters, and Actions are managed centrally in `app/stores/calculator.ts`

import { storeToRefs } from 'pinia'
import { useCalculatorStore } from '~/stores/calculator'
import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionRoot,
  TransitionChild,
} from '@headlessui/vue'
import {
  ChevronDownIcon,
  BeakerIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  ClipboardDocumentIcon,
  ClipboardDocumentCheckIcon,
  QuestionMarkCircleIcon,
  BackspaceIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/vue/20/solid'

// Access the Pinia store
const calcStore = useCalculatorStore()

// Reactive state & getters via storeToRefs
const {
  expr,
  answer,
  lastAnswer,
  cursor,
  history,
  soundEnabled,
  isCopied,
  displayParts,
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
  toggleNegate,
  backspace,
  moveCursor,
  equals,
  restoreHistory,
  clearHistory,
  clearAll,
  toggleSound,
  copyToClipboard,
} = calcStore

// Local UI state
const isHelpOpen = ref(false)
const exprContainerRef = ref<HTMLElement | null>(null)

// Auto-scroll expression viewport to keep cursor visible
watch(cursor, () => {
  nextTick(() => {
    if (exprContainerRef.value) {
      exprContainerRef.value.scrollLeft = exprContainerRef.value.scrollWidth
    }
  })
})

// Global keyboard navigation
function handleKeydown(event: KeyboardEvent) {
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
</script>

<template>
  <main class="relative flex min-h-screen flex-col items-center justify-center bg-neutral-950 p-4 font-sans text-neutral-100 antialiased selection:bg-emerald-500/30">
    <!-- Subtle ambient background glow -->
    <div class="pointer-events-none absolute inset-0 overflow-hidden">
      <div class="absolute -top-40 left-1/2 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[140px]" />
      <div class="absolute -bottom-40 right-1/4 h-[24rem] w-[24rem] rounded-full bg-teal-500/5 blur-[120px]" />
    </div>

    <!-- Main Container -->
    <div class="relative z-10 flex w-full max-w-sm flex-col gap-3">
      <!-- ================= Header Bar ================= -->
      <header class="flex items-center justify-between px-1">
        <!-- Title & Pinia Pill -->
        <div class="flex items-center gap-2">
          <h1 class="text-sm font-bold tracking-tight text-white">Scientific</h1>
          <span class="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
            <span class="size-1.5 rounded-full bg-emerald-400" />
            Pinia
          </span>
        </div>

        <!-- Controls: Sound, History, Help, Inspector -->
        <div class="flex items-center gap-1.5">
          <!-- Audio Toggle -->
          <button
            type="button"
            class="flex size-7 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-white/10 hover:text-white"
            :title="soundEnabled ? 'Mute sound clicks' : 'Enable sound clicks'"
            @click="toggleSound"
          >
            <SpeakerWaveIcon v-if="soundEnabled" class="size-4" />
            <SpeakerXMarkIcon v-else class="size-4 text-neutral-500" />
          </button>

          <!-- Shortcuts Dialog Trigger -->
          <button
            type="button"
            class="flex size-7 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-white/10 hover:text-white"
            title="Keyboard shortcuts (?)"
            @click="isHelpOpen = true"
          >
            <QuestionMarkCircleIcon class="size-4" />
          </button>

          <!-- History Popover -->
          <Popover class="relative">
            <PopoverButton
              class="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs font-medium text-neutral-300 transition hover:bg-white/10 hover:text-white"
            >
              <span>History</span>
              <span
                v-if="historyCount > 0"
                class="flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-500/20 px-1 text-[10px] font-bold text-emerald-300"
              >
                {{ historyCount }}
              </span>
              <ChevronDownIcon class="size-3 opacity-60" />
            </PopoverButton>

            <transition
              enter-active-class="transition duration-150 ease-out"
              enter-from-class="translate-y-1 opacity-0"
              enter-to-class="translate-y-0 opacity-100"
              leave-active-class="transition duration-100 ease-in"
              leave-from-class="translate-y-0 opacity-100"
              leave-to-class="translate-y-1 opacity-0"
            >
              <PopoverPanel class="absolute right-0 z-30 mt-2 w-72 overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/95 shadow-2xl backdrop-blur-xl">
                <div class="flex items-center justify-between border-b border-white/10 px-3.5 py-2.5">
                  <span class="text-xs font-semibold uppercase tracking-wider text-neutral-400">History Log</span>
                  <button
                    v-if="history.length > 0"
                    type="button"
                    class="inline-flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300 transition"
                    @click="clearHistory"
                  >
                    <TrashIcon class="size-3" />
                    <span>Clear</span>
                  </button>
                </div>

                <div class="max-h-60 divide-y divide-white/5 overflow-y-auto p-2">
                  <p v-if="history.length === 0" class="py-6 text-center text-xs text-neutral-500">
                    No calculations recorded yet
                  </p>

                  <div
                    v-for="(item, i) in history"
                    :key="i"
                    class="group flex flex-col rounded-lg p-2 text-right font-mono transition hover:bg-white/5"
                  >
                    <div class="flex items-center justify-between text-[11px]">
                      <button
                        type="button"
                        class="text-neutral-500 opacity-0 transition group-hover:opacity-100 hover:text-neutral-300"
                        title="Copy result"
                        @click="copyToClipboard(item.result)"
                      >
                        <ClipboardDocumentIcon class="size-3.5" />
                      </button>
                      <span class="truncate text-neutral-400">{{ item.shown }}</span>
                    </div>
                    <button
                      type="button"
                      class="mt-0.5 truncate text-sm font-semibold text-white transition hover:underline"
                      title="Load formula into calculator"
                      @click="restoreHistory(item.raw)"
                    >
                      = {{ item.result }}
                    </button>
                  </div>
                </div>
              </PopoverPanel>
            </transition>
          </Popover>

          <!-- Inspector Lab Link -->
          <NuxtLink
            to="/calculus2"
            class="inline-flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/20"
            title="State Management Inspector Lab"
          >
            <BeakerIcon class="size-3.5" />
            <span class="hidden sm:inline">Lab</span>
          </NuxtLink>
        </div>
      </header>

      <!-- ================= Calculator Chassis ================= -->
      <section class="rounded-3xl border border-neutral-800 bg-neutral-900/90 p-4 shadow-2xl backdrop-blur-xl">
        <!-- Screen / Display Unit -->
        <div class="relative mb-3 flex flex-col justify-between rounded-2xl border border-neutral-800/80 bg-neutral-950 p-4 font-mono select-none">
          <!-- Top Sub-bar (Indicators & Copy) -->
          <div class="flex items-center justify-between text-[10px] text-neutral-500">
            <div class="flex items-center gap-2">
              <span class="font-bold tracking-widest text-neutral-400">DEG</span>
              <span v-if="lastAnswer !== 0" class="rounded bg-white/5 px-1.5 py-0.5 text-neutral-300">
                ANS: {{ lastAnswer }}
              </span>
            </div>

            <!-- Click to Copy -->
            <button
              type="button"
              class="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-neutral-400 transition hover:bg-white/10 hover:text-neutral-200"
              :title="isCopied ? 'Copied to clipboard!' : 'Copy result'"
              @click="copyToClipboard()"
            >
              <ClipboardDocumentCheckIcon v-if="isCopied" class="size-3 text-emerald-400" />
              <ClipboardDocumentIcon v-else class="size-3" />
              <span>{{ isCopied ? 'Copied' : 'Copy' }}</span>
            </button>
          </div>

          <!-- Active Expression Line (With Blinking Cursor) -->
          <div
            ref="exprContainerRef"
            class="no-scrollbar my-2 overflow-x-auto whitespace-nowrap text-left text-2xl tracking-wide text-neutral-200"
          >
            <template v-if="expr === ''">
              <span class="opacity-30">0</span>
              <span class="animate-pulse font-bold text-emerald-400">|</span>
            </template>

            <!-- Render tokens with root bars and superscript powers -->
            <span
              v-for="(part, i) in displayParts"
              :key="i"
              :class="part.bar ? 'border-t-2 border-current pt-0.5' : ''"
              :style="part.level > 0
                ? { fontSize: `${Math.pow(0.72, part.level)}em`, verticalAlign: 'super' }
                : {}"
            ><!-- Jammed tags to prevent synthetic spaces in inline math --><template
                v-for="(chunk, j) in part.chunks"
                :key="j"
              ><span v-if="j > 0" class="animate-pulse font-bold text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.5)]">|</span>{{ chunk }}</template></span>
          </div>

          <!-- Answer Result Line -->
          <div class="flex items-baseline justify-end text-right">
            <span
              class="cursor-pointer text-3xl font-bold tracking-tight text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)] transition hover:opacity-90"
              :title="answer ? 'Click to copy answer' : undefined"
              @click="answer && copyToClipboard(answer)"
            >
              {{ answer ? `= ${answer}` : '&nbsp;' }}
            </span>
          </div>
        </div>

        <!-- ================= Precision Navigation Bar ================= -->
        <div class="mb-3 flex items-center justify-between gap-1.5">
          <!-- All Clear & Backspace -->
          <div class="flex items-center gap-1.5">
            <button
              type="button"
              class="btn-press flex h-9 items-center justify-center rounded-xl border border-rose-900/40 bg-rose-950/60 px-3 text-xs font-bold text-rose-300 transition hover:bg-rose-900/60"
              title="All Clear (Esc)"
              @click="clearAll"
            >
              AC
            </button>
            <button
              type="button"
              class="btn-press flex h-9 items-center justify-center rounded-xl border border-neutral-700/50 bg-neutral-800 px-2.5 text-neutral-300 transition hover:bg-neutral-700 hover:text-white"
              title="Delete character (Backspace)"
              @click="backspace"
            >
              <BackspaceIcon class="size-4" />
            </button>
          </div>

          <!-- Cursor Navigation Steps -->
          <div class="flex items-center rounded-xl border border-neutral-800 bg-neutral-950 p-0.5">
            <button
              type="button"
              class="flex h-8 w-7 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-neutral-800 hover:text-white active:scale-95"
              title="Jump to Start (Home)"
              @click="moveCursor('start')"
            >
              <span class="text-[11px] font-mono font-bold">&vert;&lt;</span>
            </button>
            <button
              type="button"
              class="flex h-8 w-7 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-neutral-800 hover:text-white active:scale-95"
              title="Step Left (←)"
              @click="moveCursor('left')"
            >
              <ChevronLeftIcon class="size-4" />
            </button>
            <button
              type="button"
              class="flex h-8 w-7 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-neutral-800 hover:text-white active:scale-95"
              title="Step Right (→)"
              @click="moveCursor('right')"
            >
              <ChevronRightIcon class="size-4" />
            </button>
            <button
              type="button"
              class="flex h-8 w-7 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-neutral-800 hover:text-white active:scale-95"
              title="Jump to End (End)"
              @click="moveCursor('end')"
            >
              <span class="text-[11px] font-mono font-bold">&gt;&vert;</span>
            </button>
          </div>

          <!-- Memory Ans Button -->
          <button
            type="button"
            class="btn-press flex h-9 items-center justify-center rounded-xl border border-neutral-700/50 bg-neutral-800 px-3 font-mono text-xs font-bold text-emerald-400 transition hover:bg-neutral-700"
            title="Use Last Answer (A)"
            @click="inputAns"
          >
            Ans
          </button>
        </div>

        <!-- ================= Keypad Grid ================= -->
        <div class="grid grid-cols-4 gap-2">
          <!-- Row 1: Scientific Functions -->
          <button
            type="button"
            class="btn-press flex aspect-[1.2/1] items-center justify-center rounded-2xl border border-neutral-700/40 bg-neutral-800/70 text-sm font-semibold text-emerald-300 transition hover:bg-neutral-700/80"
            title="Square Root (R)"
            @click="inputSqrt"
          >
            &radic;x
          </button>
          <button
            type="button"
            class="btn-press flex aspect-[1.2/1] items-center justify-center rounded-2xl border border-neutral-700/40 bg-neutral-800/70 text-sm font-semibold text-emerald-300 transition hover:bg-neutral-700/80"
            title="Power exponent (^)"
            @click="chooseOperator('^')"
          >
            x<sup class="text-[0.75em]">y</sup>
          </button>
          <button
            type="button"
            class="btn-press flex aspect-[1.2/1] items-center justify-center rounded-2xl border border-neutral-700/40 bg-neutral-800/70 text-sm font-semibold text-emerald-300 transition hover:bg-neutral-700/80"
            title="Nth Root (ⁿ√)"
            @click="inputNthRoot"
          >
            <sup class="text-[0.75em]">y</sup>&radic;x
          </button>
          <button
            type="button"
            class="btn-press flex aspect-[1.2/1] items-center justify-center rounded-2xl bg-emerald-600 text-xl font-bold text-white transition hover:bg-emerald-500"
            title="Divide (/)"
            @click="chooseOperator('÷')"
          >
            &divide;
          </button>

          <!-- Row 2: 7, 8, 9, × -->
          <button
            type="button"
            class="btn-press flex aspect-[1.2/1] items-center justify-center rounded-2xl border border-neutral-700/40 bg-neutral-800 text-xl font-medium text-white transition hover:bg-neutral-700"
            @click="inputDigit('7')"
          >
            7
          </button>
          <button
            type="button"
            class="btn-press flex aspect-[1.2/1] items-center justify-center rounded-2xl border border-neutral-700/40 bg-neutral-800 text-xl font-medium text-white transition hover:bg-neutral-700"
            @click="inputDigit('8')"
          >
            8
          </button>
          <button
            type="button"
            class="btn-press flex aspect-[1.2/1] items-center justify-center rounded-2xl border border-neutral-700/40 bg-neutral-800 text-xl font-medium text-white transition hover:bg-neutral-700"
            @click="inputDigit('9')"
          >
            9
          </button>
          <button
            type="button"
            class="btn-press flex aspect-[1.2/1] items-center justify-center rounded-2xl bg-emerald-600 text-xl font-bold text-white transition hover:bg-emerald-500"
            title="Multiply (*)"
            @click="chooseOperator('×')"
          >
            &times;
          </button>

          <!-- Row 3: 4, 5, 6, − -->
          <button
            type="button"
            class="btn-press flex aspect-[1.2/1] items-center justify-center rounded-2xl border border-neutral-700/40 bg-neutral-800 text-xl font-medium text-white transition hover:bg-neutral-700"
            @click="inputDigit('4')"
          >
            4
          </button>
          <button
            type="button"
            class="btn-press flex aspect-[1.2/1] items-center justify-center rounded-2xl border border-neutral-700/40 bg-neutral-800 text-xl font-medium text-white transition hover:bg-neutral-700"
            @click="inputDigit('5')"
          >
            5
          </button>
          <button
            type="button"
            class="btn-press flex aspect-[1.2/1] items-center justify-center rounded-2xl border border-neutral-700/40 bg-neutral-800 text-xl font-medium text-white transition hover:bg-neutral-700"
            @click="inputDigit('6')"
          >
            6
          </button>
          <button
            type="button"
            class="btn-press flex aspect-[1.2/1] items-center justify-center rounded-2xl bg-emerald-600 text-xl font-bold text-white transition hover:bg-emerald-500"
            title="Subtract (-)"
            @click="chooseOperator('-')"
          >
            &minus;
          </button>

          <!-- Row 4: 1, 2, 3, + -->
          <button
            type="button"
            class="btn-press flex aspect-[1.2/1] items-center justify-center rounded-2xl border border-neutral-700/40 bg-neutral-800 text-xl font-medium text-white transition hover:bg-neutral-700"
            @click="inputDigit('1')"
          >
            1
          </button>
          <button
            type="button"
            class="btn-press flex aspect-[1.2/1] items-center justify-center rounded-2xl border border-neutral-700/40 bg-neutral-800 text-xl font-medium text-white transition hover:bg-neutral-700"
            @click="inputDigit('2')"
          >
            2
          </button>
          <button
            type="button"
            class="btn-press flex aspect-[1.2/1] items-center justify-center rounded-2xl border border-neutral-700/40 bg-neutral-800 text-xl font-medium text-white transition hover:bg-neutral-700"
            @click="inputDigit('3')"
          >
            3
          </button>
          <button
            type="button"
            class="btn-press flex aspect-[1.2/1] items-center justify-center rounded-2xl bg-emerald-600 text-xl font-bold text-white transition hover:bg-emerald-500"
            title="Add (+)"
            @click="chooseOperator('+')"
          >
            +
          </button>

          <!-- Row 5: ±, 0, ., = -->
          <button
            type="button"
            class="btn-press flex aspect-[1.2/1] items-center justify-center rounded-2xl border border-neutral-700/40 bg-neutral-800 text-base font-semibold text-neutral-300 transition hover:bg-neutral-700 hover:text-white"
            title="Negate sign (±)"
            @click="toggleNegate"
          >
            &plusmn;
          </button>
          <button
            type="button"
            class="btn-press flex aspect-[1.2/1] items-center justify-center rounded-2xl border border-neutral-700/40 bg-neutral-800 text-xl font-medium text-white transition hover:bg-neutral-700"
            @click="inputDigit('0')"
          >
            0
          </button>
          <button
            type="button"
            class="btn-press flex aspect-[1.2/1] items-center justify-center rounded-2xl border border-neutral-700/40 bg-neutral-800 text-xl font-medium text-white transition hover:bg-neutral-700"
            @click="inputDot"
          >
            .
          </button>
          <button
            type="button"
            class="btn-press flex aspect-[1.2/1] items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-2xl font-black text-neutral-950 shadow-[0_0_20px_rgba(16,185,129,0.35)] transition hover:opacity-95"
            title="Calculate (Enter or =)"
            @click="equals"
          >
            =
          </button>
        </div>
      </section>
    </div>

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
          <div class="fixed inset-0 bg-black/80 backdrop-blur-sm" />
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
              <DialogPanel class="w-full max-w-sm rounded-3xl border border-neutral-800 bg-neutral-900 p-6 text-white shadow-2xl">
                <DialogTitle class="flex items-center justify-between text-base font-bold">
                  <span>Keyboard Shortcuts</span>
                  <span class="rounded bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-400">Guide</span>
                </DialogTitle>

                <div class="mt-4 space-y-2 text-xs font-mono">
                  <div class="flex justify-between border-b border-white/5 py-1.5">
                    <span class="text-neutral-400">Numbers & Decimal</span>
                    <span class="font-bold text-white">0 - 9, .</span>
                  </div>
                  <div class="flex justify-between border-b border-white/5 py-1.5">
                    <span class="text-neutral-400">Arithmetic Operators</span>
                    <span class="font-bold text-white">+ - * / ^</span>
                  </div>
                  <div class="flex justify-between border-b border-white/5 py-1.5">
                    <span class="text-neutral-400">Calculate</span>
                    <span class="font-bold text-emerald-400">Enter or =</span>
                  </div>
                  <div class="flex justify-between border-b border-white/5 py-1.5">
                    <span class="text-neutral-400">Backspace (Delete char)</span>
                    <span class="font-bold text-white">Backspace</span>
                  </div>
                  <div class="flex justify-between border-b border-white/5 py-1.5">
                    <span class="text-neutral-400">All Clear</span>
                    <span class="font-bold text-rose-400">Escape or Del</span>
                  </div>
                  <div class="flex justify-between border-b border-white/5 py-1.5">
                    <span class="text-neutral-400">Square Root</span>
                    <span class="font-bold text-white">R</span>
                  </div>
                  <div class="flex justify-between border-b border-white/5 py-1.5">
                    <span class="text-neutral-400">Ans (Previous Memory)</span>
                    <span class="font-bold text-white">A</span>
                  </div>
                  <div class="flex justify-between py-1.5">
                    <span class="text-neutral-400">Cursor Navigation</span>
                    <span class="font-bold text-white">&larr; &rarr; Home End</span>
                  </div>
                </div>

                <div class="mt-6">
                  <button
                    type="button"
                    class="w-full rounded-xl bg-neutral-800 py-2.5 text-xs font-semibold text-white transition hover:bg-neutral-700"
                    @click="isHelpOpen = false"
                  >
                    Close
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
