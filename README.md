# 🍍 Scientific Calculator & Pinia State Management Lab

A clean, modern, professional scientific calculator built with **Nuxt 4**, **Vue 3**, **Pinia**, and **Tailwind CSS v4**.

This project provides a full-featured scientific calculator experience paired with a practical **educational masterclass in modern Vue/Nuxt State Management**, demonstrating how to design, decouple, and persist application state using Pinia stores.

---

## ⚡ Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Start development server
pnpm dev              # http://localhost:3000

# 3. LAN preview (test on mobile/tablet via same Wi-Fi)
pnpm dev --host

# 4. Production build & preview
pnpm build
pnpm preview
```

---

## 🧭 Architectural Overview

The application is structured into **three strict, decoupled layers**:

```
┌────────────────────────────────────────────────────────┐
│  Presentation Layer (Vue 3 Components)                 │
│  • app/pages/index.vue       (Scientific Calculator)   │
│  • app/pages/calculus2.vue   (State Inspector Lab)     │
└───────────────────────────┬────────────────────────────┘
                            │ uses
┌───────────────────────────▼────────────────────────────┐
│  State Management Layer (Pinia Stores)                 │
│  • app/stores/calculator.ts  (State, Getters, Actions) │
│  • app/stores/counter.ts     (Pedagogical Store)       │
│  • app/composables/          (Bridge Composables)      │
└───────────────────────────┬────────────────────────────┘
                            │ delegates to
┌───────────────────────────▼────────────────────────────┐
│  Domain & Math Engine (Pure TypeScript Functions)      │
│  • app/utils/math.ts         (Atomic calculations)     │
│  • app/utils/parser.ts       (Tokenization & AST)      │
│  • app/utils/input.ts        (Input validation rules)  │
│  • app/utils/display.ts      (Text -> Drawable runs)   │
│  • app/utils/history.ts      (Immutable history queue) │
│  • app/utils/types.ts        (TypeScript contracts)    │
└────────────────────────────────────────────────────────┘
```

> **The Purity Boundary (`app/utils/`):**
> Nothing inside `app/utils/` imports Vue, touches a `ref`, or knows that a browser DOM exists. Mathematical evaluation is 100% pure and deterministic. This guarantees complete testability without mocking any UI or framework dependencies.

---

## 🔬 Scientific Calculator Capabilities

### 1. Advanced Math Functions
*   **Trigonometry**: `sin`, `cos`, `tan`
*   **Inverse Trigonometry**: `sin⁻¹` (arcsin), `cos⁻¹` (arccos), `tan⁻¹` (arctan) via `2nd` shift
*   **Angle Modes**: Interactive toggle between **DEG** (Degrees) and **RAD** (Radians), with exact degree trigonometric normalization (e.g. $\sin(180^\circ) = 0$, $\cos(90^\circ) = 0$)
*   **Logarithms**: Natural logarithm $\ln(x)$ and common logarithm $\log_{10}(x)$, plus $e^x$ and $10^x$ via `2nd`
*   **Constants**: High-precision $\pi$ ($3.1415926535...$) and Euler's number $e$ ($2.7182818284...$)
*   **Powers & Roots**: Square ($x^2$), exponentiation ($x^y$), square root ($\sqrt{x}$), cube root ($\sqrt[3]{x}$), and arbitrary degree roots ($\sqrt[n]{x}$)
*   **Combinatorics & Discrete**: Factorial ($n!$) and percentage ($\%$)
*   **Parentheses & Grouping**: Full algebraic precedence supporting arbitrarily nested `(` and `)` subexpressions with **implicit multiplication** (e.g. $2(3+4) = 14$, $2\pi \approx 6.283$)

### 2. Precision LCD Display & Controls
*   **Top Status Indicator Strip**:
    *   `DEG` / `RAD` active mode badge (click to toggle instantly)
    *   `2ND` function indicator (illuminates when secondary functions are enabled)
    *   `ANS` memory badge displaying last computed result
    *   One-click `Copy` button with visual confirmation
*   **Dynamic Expression Viewport**:
    *   Formatted root bars ($\sqrt{\dots}$) and superscript powers
    *   Blinking cursor with horizontal auto-scroll
*   **Editing & Navigation Controls**:
    *   `AC`: All Clear
    *   `DEL`: Smart Backspace (deletes entire function tokens like `sin(` in a single press)
    *   Navigation Controls: Jump to Start ($|<$), Step Left ($\leftarrow$), Step Right ($\rightarrow$), Jump to End ($>|$)
    *   `Ans`: Recalls previous result memory

---

## 🍍 Deep Dive: Pinia & State Management

### 1. State Mechanism Comparison

| Feature | Local `ref()` | Nuxt `useState()` | Pinia `defineStore()` |
| :--- | :--- | :--- | :--- |
| **Scope** | Component only | Nuxt app-wide (SSR-safe) | Global application store |
| **Persistence** | Lost on unmount | Survives in-memory route navigation | Synchronized with `localStorage` |
| **Computed Getters** | Manual per component | None (bare ref) | Native, memoized `getters` |
| **Actions** | Local functions | None | Centralized, testable `actions` |
| **DevTools Support** | Basic Vue DevTools | Limited | Full time-travel debugging |
| **Ideal Use Case** | Modals, input drafts | SSR hydration keys | Core application logic, calculator, carts |

### 2. Anatomical Breakdown of `useCalculatorStore`

Located in `app/stores/calculator.ts`, the store uses the modern **Setup Store** syntax:

#### A. State (Single Source of Truth)
```ts
const expr = ref('')                   // Current mathematical formula string
const answer = ref<string | null>(null)// Evaluated result after '='
const lastAnswer = ref<number>(0)      // Last valid answer for 'Ans' key
const cursor = ref<number>(0)          // Insertion cursor position index
const angleMode = ref<AngleMode>('DEG')// Angle mode ('DEG' | 'RAD')
const isShift = ref<boolean>(false)    // 2nd function active state
const history = ref<HistoryItem[]>([]) // Persisted calculation log
const soundEnabled = ref(true)         // Tactile click toggle
```

#### B. Getters (Computed Projections)
```ts
const beforeCursor = computed(() => expr.value.slice(0, cursor.value))
const afterCursor = computed(() => expr.value.slice(cursor.value))
const displayParts = computed(() => buildDisplayParts(beforeCursor.value, afterCursor.value))
const historyCount = computed(() => history.value.length)
const isDeg = computed(() => angleMode.value === 'DEG')
```

#### C. Reactivity Preservation with `storeToRefs()`
When consuming a store inside a component or composable, destructuring properties directly breaks Vue reactivity. Use `storeToRefs()` to keep state and getters reactive:

```ts
import { storeToRefs } from 'pinia'
import { useCalculatorStore } from '~/stores/calculator'

const calcStore = useCalculatorStore()

// State and getters remain active Vue Refs:
const { expr, answer, cursor, angleMode, isShift } = storeToRefs(calcStore)

// Actions can be destructured directly (functions are not refs):
const { inputDigit, chooseOperator, equals } = calcStore
```

---

## ⌨️ Keyboard Navigation

You can operate the entire calculator without touching your mouse:

| Key | Calculator Action | Description |
| :--- | :--- | :--- |
| `0` - `9`, `.` | Digits & Decimal | Inserts digit or decimal point |
| `+` `-` `*` `/` | Arithmetic Operators | Addition, subtraction, multiplication (`×`), division (`÷`) |
| `^` | Power | Exponentiation ($x^y$) |
| `(` `)` | Parentheses | Groups subexpressions |
| `S` `C` `T` | Trigonometry | Inserts `sin(`, `cos(`, `tan(` (or inverses when 2nd active) |
| `L` `G` | Logarithms | Inserts `ln(` or `log(` |
| `P` `E` | Constants | Inserts $\pi$ or $e$ |
| `!` | Factorial | Inserts factorial ($n!$) |
| `%` | Percentage | Inserts percentage ($\%$) |
| `R` | Square Root | Inserts $\sqrt{}$ |
| `A` | Ans | Recalls previous answer memory |
| `D` | Angle Mode | Toggles between `DEG` and `RAD` |
| `Enter` or `=` | Calculate | Evaluates expression |
| `Backspace` | DEL | Deletes character or function before cursor |
| `Escape` / `Delete` | AC | All Clear |
| `←` `→` `Home` `End` | Cursor Navigation | Moves cursor through the formula |
| `?` | Help | Opens keyboard shortcuts guide |

---

## 🧪 Interactive State Inspector (`/calculus2`)

Navigate to `/calculus2` (or click the **Lab** button at the top of the calculator) to enter the **State Management Lab**:
*   **Side-by-side Matrix**: Directly test and compare `ref()`, `useState()`, and `Pinia defineStore()`.
*   **Cross-Component Sync**: Dispatch a test calculation (`12 × 8 = 96`) from the inspector, and return to the calculator to see the state updated in real-time.
*   **Store Telemetry**: Inspect live store metrics (expression string, last result, angle mode, and history count).

---

## 📐 Mathematical Precedence Ladder

The pure math engine in `app/utils/parser.ts` implements a deterministic **Recursive Descent Precedence Ladder**:

```
readExpr      (+)  (-)                Lowest precedence (evaluated last)
   │
readTerm      (×)  (÷)  (implicit *)  Medium precedence
   │
readPower     (^)  (ⁿ)                Higher precedence (Right-associative)
   │
readPostfix   (!)  (%)                Postfix functions
   │
readUnary     (+/-) (√) (³√)          Unary operators
   │
readPrimary   ((expr), sin, cos, ...) Atomic operands & functions
```

---

## 📄 License

MIT. Built with Vue 3, Nuxt 4, Pinia, and Tailwind CSS.
