# 🍍 Scientific Calculator & Pinia State Management Lab

A modern, tactile scientific calculator built with **Nuxt 4**, **Vue 3**, **Pinia**, and **Tailwind CSS v4**. 

This project serves as both a high-precision scientific calculator and a practical **educational masterclass in modern Vue/Nuxt State Management**, showcasing how to design, organize, and inspect global state using Pinia stores.

---

## ⚡ Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Start development server
pnpm dev              # http://localhost:3000

# 3. LAN preview (test on mobile/tablet via same Wi-Fi)
pnpm dev --host

# 4. Production build
pnpm build
pnpm preview
```

---

## 🧭 Architectural Overview

The application is structured into **three strict, decoupled layers**. Each layer only communicates with the layer directly beneath it:

```
┌────────────────────────────────────────────────────────┐
│  Presentation Layer (Vue Components)                   │
│  • app/pages/index.vue       (Calculator UI & Keypad)  │
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
│  Domain & Math Engine (Pure Functions)                 │
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

## 🍍 Deep Dive: Pinia & State Management

### 1. Why State Management?
In small Vue apps, local component state (`ref()`) is sufficient. But as an app grows or needs to share state across views (e.g., between the calculator and the state inspector, or persisting calculations across refreshes), local state leads to:
- **Prop drilling**: Passing state down through multiple component levels.
- **State divergence**: Multiple components holding desynchronized copies of the same value.
- **Loss of state on navigation**: Unmounting a route destroys local component `ref()`s.

### 2. State Mechanism Comparison

| Feature | Local `ref()` | Nuxt `useState()` | Pinia `defineStore()` |
| :--- | :--- | :--- | :--- |
| **Scope** | Component only | Nuxt app-wide (SSR-safe) | Global application store |
| **Persistence** | Lost on unmount | Survives in-memory route navigation | Synchronized with `localStorage` |
| **Computed Getters** | Manual per component | None (bare ref) | Native, memoized `getters` |
| **Actions** | Local functions | None | Centralized, testable `actions` |
| **DevTools Support** | Basic Vue DevTools | Limited | Full time-travel debugging |
| **Ideal Use Case** | Modals, input drafts | SSR hydration keys | Core application logic, carts, calculator |

---

### 3. Anatomical Breakdown of `useCalculatorStore`

Located in `app/stores/calculator.ts`, the store uses the modern **Setup Store** syntax:

#### A. State (Single Source of Truth)
```ts
const expr = ref('')                   // Current mathematical formula string
const answer = ref<string | null>(null)// Evaluated result after '='
const lastAnswer = ref<number>(0)      // Last valid answer for 'Ans' key
const cursor = ref<number>(0)          // Insertion cursor position index
const history = ref<HistoryItem[]>([]) // Persisted calculation log
const soundEnabled = ref(true)         // Tactile click synthesizer toggle
const theme = ref<CalculatorTheme>('obsidian') // Theme preference
```

#### B. Getters (Computed Projections)
Getters are computed values derived reactively from state:
```ts
// Splits expression into segments before and after the cursor
const beforeCursor = computed(() => expr.value.slice(0, cursor.value))
const afterCursor = computed(() => expr.value.slice(cursor.value))

// Transforms raw text into rendered math structures (powers, root bars)
const displayParts = computed(() => buildDisplayParts(beforeCursor.value, afterCursor.value))
const historyCount = computed(() => history.value.length)
```

#### C. Actions (Business Logic & Mutations)
Actions contain all the operations that modify store state and handle side-effects:
```ts
function inputDigit(digit: string) { /* ... */ }
function chooseOperator(op: Operator) { /* ... */ }
function backspace() { /* removes character before cursor */ }
function equals() { /* runs parser and pushes to history */ }
function copyToClipboard(text?: string) { /* clipboard API */ }
```

#### D. Reactivity Preservation with `storeToRefs()`
When consuming a store inside a component or composable, destructuring properties directly breaks Vue reactivity. We use `storeToRefs()` to keep state and getters reactive:

```ts
import { storeToRefs } from 'pinia'
import { useCalculatorStore } from '~/stores/calculator'

const calcStore = useCalculatorStore()

// State and getters become active Vue Refs:
const { expr, answer, cursor, displayParts } = storeToRefs(calcStore)

// Actions can be destructured directly (functions are not reactive refs):
const { inputDigit, chooseOperator, equals } = calcStore
```

---

## 🎨 UI & UX Improvements

### 1. Tactile Keypad & Physics Feedback
- **Active Press States**: Realistic button depression (`transform: translateY(1.5px) scale(0.97)`).
- **Web Audio Tactile Click**: Generates a 20ms mechanical frequency tick via the browser's native Web Audio API (can be toggled on/off).
- **Clear Semantic Visual Hierarchy**:
  - **Numbers (0-9)**: Crisp high-contrast matte surfaces.
  - **Operators (+ - × ÷)**: Accent colors with subtle ambient glow.
  - **Scientific Functions (√, xʸ, ʸ√x, Ans)**: Distinct secondary styling.
  - **Destructive Keys (AC, DEL)**: Ruby/Rose warning highlights.
  - **Equals (=)**: Prominent hero action button.

### 2. Multi-Theme Engine
Switch between 4 hand-crafted visual identities on the fly:
- **Obsidian OLED**: High-contrast true black with vibrant emerald glow and dot-matrix screen.
- **Cyberpunk Neon**: Electric violet and cyan gradient chassis with futuristic synth aesthetics.
- **Retro Amber**: Warm 1980s scientific handheld with glowing vintage amber display.
- **Clean Slate**: Modern Scandinavian titanium and icy-blue minimalist finish.

### 3. Display & Editing Enhancements
- **Interactive Cursor & D-Pad**: Move the insertion cursor left, right, jump to start (Home), or jump to end (End).
- **Backspace (`DEL`)**: Delete erroneous characters without clearing the entire formula.
- **One-Click Clipboard Copy**: Click the result or the copy button to copy values directly to your clipboard with toast notification.
- **History Drawer**: Review previous calculations, restore past formulas with one tap, or copy past results.
- **Live Pinia State Debugger**: An expandable bottom drawer in `index.vue` showing live store state and a stream of dispatched actions with timestamps.

---

## ⌨️ Full Keyboard Navigation

You can operate the entire calculator without touching your mouse:

| Key | Calculator Action | Description |
| :--- | :--- | :--- |
| `0` - `9` | Digit | Inserts digit into formula |
| `.` or `,` | Decimal Dot | Adds decimal point (auto-prefixes `0.` if empty) |
| `+` | Plus | Add operator |
| `-` | Minus | Subtract operator |
| `*` or `x` | Multiply | Multiplies (`×`) |
| `/` | Divide | Divides (`÷`) |
| `^` | Power | Exponentiation (`xʸ`) |
| `r` or `R` | Square Root | Inserts `√` |
| `a` or `A` | Ans | Reuses previous answer memory |
| `Enter` or `=` | Calculate | Evaluates formula |
| `Backspace` | DEL | Deletes character before cursor |
| `Escape` or `Delete` | AC | Clears the entire formula |
| `←` / `→` | Cursor Left / Right | Moves insertion cursor step by step |
| `Home` / `End` | Start / End | Jumps cursor to beginning or end of line |
| `?` | Help | Opens keyboard shortcuts dialog |

---

## 🧪 Interactive State Inspector (`/calculus2`)

Navigate to `/calculus2` (or click the **Inspector** button at the top of the calculator) to enter the **State Management Lab**:
- **Side-by-side Live Matrix**: Directly compare `ref()`, `useState()`, and `Pinia defineStore()` side-by-side with live buttons.
- **Cross-Component Synchronization**: Mutate the Pinia counter or dispatch a test calculation (`12 × 8 = 96`) from the inspector, then switch back to `/` to see the calculator update in real-time.
- **Store Telemetry View**: Inspect real-time store metrics (expression length, memory answer, history count, and dispatched action logs).

---

## 📐 How the Mathematical Engine Works

The math engine in `app/utils/parser.ts` implements a deterministic **Recursive Descent Precedence Ladder**:

```
readExpr      (+)  (-)         Lowest precedence (evaluated last)
   │
readTerm      (×)  (÷)         Medium precedence
   │
readPower     (^)  (ⁿ)         Higher precedence (Right-associative)
   │
readUnary     (-5) (√9) (Ans)  Highest precedence (Atomic value)
```

### Precedence in Action: `2 + 3 × 4`
1. `readExpr` calls `readTerm` to get the left operand.
2. `readTerm` handles `3 × 4`, evaluating to `12` before `readExpr` ever performs addition.
3. `readExpr` computes `2 + 12 = 14`.

### Left-to-Right vs Right-to-Left Exponents
- `readTerm` uses a `while` loop (working **left to right**): `8 - 3 - 2` becomes `(8 - 3) - 2 = 3`.
- `readPower` uses recursion (working **right to left**): `2 ^ 3 ^ 2` becomes `2 ^ (3 ^ 2) = 2 ^ 9 = 512`.

---

## 🛠️ Project Structure

```
calculator/
├── app/
│   ├── app.vue                  # Root Nuxt layout
│   ├── assets/css/main.css      # Tailwind v4 import & custom tactile utilities
│   ├── pages/
│   │   ├── index.vue            # Main calculator UI, keypad, display, keyboard listener
│   │   └── calculus2.vue        # State Management & Pinia Inspector Lab
│   ├── stores/
│   │   ├── calculator.ts        # Primary Pinia Store (state, getters, actions, persistence)
│   │   └── counter.ts           # Pedagogical Pinia Store (state, getters, actions)
│   ├── composables/
│   │   ├── useCalculator.ts     # Bridge composable delegating to calculator store
│   │   ├── counter.ts           # Bridge composable delegating to counter store
│   │   └── useLocalStorage.ts   # Client-side storage sync utility
│   └── utils/
│       ├── types.ts             # Shared types, HistoryItem, Operator, DisplayPart
│       ├── math.ts              # Atomic arithmetic (calculate, format)
│       ├── input.ts             # Input rules & validation
│       ├── parser.ts            # Tokenizer & Recursive Descent evaluator
│       ├── display.ts           # Prettifies expressions for rendering
│       └── history.ts           # History list operations
├── nuxt.config.ts               # Nuxt 4 config, @pinia/nuxt, Tailwind CSS
├── package.json                 # Dependencies & scripts
└── README.md                    # Project documentation & Pinia guide
```

---

## 🔍 Things That Look Like Mistakes But Aren't

1. **Auto-Imports in Nuxt 4**:
   Nuxt auto-imports exports from `app/utils/`, `app/composables/`, and `app/stores/`. No manual `import { useCalculatorStore } from '...'` is required inside templates or components.

2. **The `CURSOR` Control Character (`\u0001`)**:
   `CURSOR` is the ASCII `\u0001` control character. It has zero graphical width and is embedded into the string before running display formatting. This allows the blinking cursor to seamlessly sit inside fractions, roots, or superscripts at the correct scale. Always keep the `\u0001` escape sequence in code.

3. **Jammed Tags in `index.vue` Display**:
   Tags inside the expression display are deliberately formatted without newlines between them (`><!-- ... --><template ...>`). A raw newline between inline HTML tags in a browser is rendered as a space, which would visually separate digits (e.g. `1 2` instead of `12`).

---

## 📄 License

MIT. Built with Vue 3, Nuxt 4, Pinia, and Tailwind CSS.
