# 🐸 Frog Mining — Technology Stack & Architecture

---

## 1. Technology Stack

### Frontend

| Layer          | Choice                | Reason                                                                                   |
| -------------- | --------------------- | ---------------------------------------------------------------------------------------- |
| **Language**   | JavaScript (ES2020+)  | Universally supported, no compilation step for Telegram Mini App WebView, largest ecosystem. |
| **Build Tool** | Vite 5                | Fastest dev server, native ES module support, optimized production builds, minimal config.  |
| **Framework**  | Vanilla JS (no framework) | Idle clicker is UI-simple; a framework adds bundle bloat. Modular architecture gives us structure without overhead. |
| **Game Engine**| Custom lightweight loop | No physics, no sprite animation — a hand-rolled game loop via `requestAnimationFrame` is lighter than Phaser/PixiJS (~50 KB vs ~1 MB). |
| **CSS**        | Vanilla CSS + Custom Properties | Telegram Mini App WebView has no framework dependency. CSS variables give us theming with zero runtime cost. |

### Backend

| Layer          | Choice               | Reason                                                                        |
| -------------- | -------------------- | ----------------------------------------------------------------------------- |
| **Runtime**    | Node.js 20 LTS       | Same language as frontend, massive ecosystem, excellent async I/O for realtime, official LTS support. |
| **Framework**  | Fastify              | 2–3× faster than Express, schema-based validation, TypeScript-ready, low overhead. |
| **Auth**       | Telegram Mini App Init Data + JWT | Telegram provides cryptographic proof of user identity — no custom auth flow needed. JWT for session tokens between requests. |

### Database

| Layer          | Choice               | Reason                                                                        |
| -------------- | -------------------- | ----------------------------------------------------------------------------- |
| **Database**   | PostgreSQL 16        | Battle-tested, handles JSON + relational data, excellent for leaderboard queries (window functions, indexes). Free tier available on Supabase/Neon. |
| **ORM**        | Prisma               | Type-safe queries, auto-generated client, migration system, excellent DX, widely adopted. |

### Realtime

| Layer          | Choice               | Reason                                                                        |
| -------------- | -------------------- | ----------------------------------------------------------------------------- |
| **Transport**  | WebSocket (native)   | Leaderboard updates, score sync, presence — low latency bidirectional.        |
| **Library**    | ws (server) + native `WebSocket` (client) | Lighter than Socket.io for our use case (no fallback polling needed — all targets are modern browsers). |
| **Protocol**   | JSON messages over WS | Simple, debuggable, sufficient for score events and leaderboard pushes.        |

### Deployment

| Layer            | Choice              | Reason                                                                         |
| ---------------- | ------------------- | ------------------------------------------------------------------------------ |
| **Frontend**     | Cloudflare Pages    | Free, global CDN, instant deploys, custom domains, perfect for static sites.   |
| **Backend**      | Railway             | Free tier, auto-deploy from Git, built-in env vars, WebSocket support, easy scaling. |
| **Database**     | Supabase (PostgreSQL) | Free tier with 500 MB, managed Postgres, built-in dashboard, easy Prisma connection. |

---

## 2. Project Folder Structure

```
frog-mining/
│
├── 📄 index.html                  # Entry HTML (Vite root)
├── 📄 vite.config.js              # Vite configuration & path aliases
├── 📄 package.json                # Dependencies & scripts
├── 📄 .gitignore
├── 📄 README.md
├── 📄 TECH_STACK.md               # ← This document
│
├── 📁 server/                     # ── BACKEND ──
│   ├── 📄 index.js                # Fastify server entry
│   ├── 📄 config.js               # Server config (env vars, ports)
│   ├── 📁 routes/                 # API route handlers
│   │   └── 📄 leaderboard.js      # GET/POST leaderboard endpoints
│   ├── 📁 middleware/             # Auth, validation, error handling
│   │   ├── 📄 auth.js             # Telegram init data verification + JWT
│   │   └── 📄 errorHandler.js     # Global error handler
│   ├── 📁 services/              # Business logic (separated from routes)
│   │   └── 📄 leaderboardService.js
│   ├── 📁 db/                    # Database layer
│   │   └── 📄 prismaClient.js    # Prisma client singleton
│   └── 📁 prisma/                # Schema & migrations
│       ├── 📄 schema.prisma      # Database schema definition
│       └── 📁 migrations/
│
├── 📁 src/                        # ── FRONTEND ──
│   ├── 📄 main.js                 # JS entry point (bootstrap)
│   │
│   ├── 📁 core/                   # Game engine & framework
│   │   ├── 📄 Game.js             # Game lifecycle controller
│   │   ├── 📄 EventBus.js         # Pub/sub event system
│   │   ├── 📄 GameLoop.js         # requestAnimationFrame loop
│   │   ├── 📄 Config.js           # Game constants & tuning values
│   │   ├── 📄 State.js            # Central game state manager
│   │   └── 📄 Network.js          # WebSocket client wrapper
│   │
│   ├── 📁 modules/                # Feature modules (one per feature)
│   │   ├── 📁 score/              # Score system
│   │   │   ├── 📄 ScoreManager.js
│   │   │   └── 📄 scoreEvents.js
│   │   ├── 📁 mining/             # Mining mechanics
│   │   ├── 📁 leaderboard/        # Leaderboard display
│   │   ├── 📁 shop/               # Shop system
│   │   ├── 📁 mail/               # Mail system
│   │   └── 📁 auto-mining/        # Auto mining / idle rewards
│   │
│   ├── 📁 ui/                     # UI components (rendering only)
│   │   ├── 📄 UIManager.js        # UI lifecycle & screen management
│   │   ├── 📁 components/         # Reusable UI components
│   │   │   ├── 📄 Button.js
│   │   │   ├── 📄 Modal.js
│   │   │   └── 📄 Toast.js
│   │   ├── 📁 screens/            # Full-screen views
│   │   │   ├── 📄 HomeScreen.js
│   │   │   ├── 📄 GameScreen.js
│   │   │   └── 📄 LeaderboardScreen.js
│   │   └── 📁 templates/          # HTML template strings
│   │
│   ├── 📁 utils/                  # Shared utility functions
│   │   ├── 📄 helpers.js          # DOM, math, formatting
│   │   ├── 📄 storage.js          # LocalStorage wrapper
│   │   └── 📄 constants.js        # Shared constants
│   │
│   └── 📁 css/                    # Stylesheets
│       ├── 📄 main.css            # CSS entry (imports)
│       ├── 📁 base/               # Reset, variables, typography
│       ├── 📁 components/         # Component-specific styles
│       ├── 📁 screens/            # Screen-specific styles
│       └── 📁 modules/            # Feature-specific styles
│
├── 📁 public/                     # Static assets (copied as-is)
│   ├── 📄 favicon.svg
│   └── 📁 assets/
│       ├── 📁 images/             # Sprites, icons, backgrounds
│       ├── 📁 sounds/             # Audio files
│       └── 📁 fonts/              # Custom fonts
│
└── 📁 dist/                       # Production build output (gitignored)
```

### Folder Purpose Summary

| Folder          | Purpose                                  | Who Works Here           |
| --------------- | ---------------------------------------- | ------------------------ |
| `server/`       | Backend API, auth, database, realtime    | Backend Developer        |
| `src/core/`     | Game engine — lifecycle, state, network  | Game Engine Developer    |
| `src/modules/`  | Feature logic — score, mining, shop      | Game Logic Developer     |
| `src/ui/`       | Rendering, screens, UI components        | UI/UX Developer          |
| `src/utils/`    | Shared helpers (no game logic)           | Anyone                   |
| `src/css/`      | All styles, organized by scope           | Frontend / UI Developer  |
| `public/`       | Static assets served directly            | Artist / Designer        |
| `prisma/`       | Database schema & migrations             | Backend Developer        |

---

## 3. Coding Standards

### 3.1 File Naming

| Type            | Convention         | Example                          |
| --------------- | ------------------ | -------------------------------- |
| JavaScript files | camelCase.js     | `ScoreManager.js`, `eventBus.js` |
| Component files  | PascalCase.js    | `Button.js`, `Modal.js`         |
| CSS files        | kebab-case.css   | `base.css`, `game-screen.css`   |
| Config files     | camelCase.js     | `vite.config.js`, `config.js`   |
| Folders          | kebab-case or lowercase | `auto-mining/`, `core/`  |

> **Note:** PascalCase for files that export a Class. camelCase for files that export functions/config.

### 3.2 Variable Naming

| Type               | Convention      | Example                      |
| ------------------ | --------------- | ---------------------------- |
| Variables          | camelCase       | `scoreCount`, `isRunning`   |
| Constants          | UPPER_SNAKE_CASE | `MAX_SCORE`, `API_URL`     |
| Private fields     | _prefix         | `_listeners`, `_state`      |
| DOM elements       | descriptive     | `scoreDisplay`, `mineButton` |
| Boolean            | is/has/can prefix | `isActive`, `hasUpgrade`  |

### 3.3 Function Naming

| Type               | Convention         | Example                        |
| ------------------ | ------------------ | ------------------------------ |
| Regular functions  | camelCase          | `calculateScore()`, `formatNumber()` |
| Event handlers     | handle/on prefix   | `handleClick()`, `onScoreUpdate()` |
| Getters            | get prefix         | `getScore()`, `getPlayerData()` |
| Setters            | set prefix         | `setScore(value)`              |
| Boolean returns    | is/has/can prefix  | `isActive()`, `canUpgrade()`  |
| Factory functions  | create prefix      | `createButton()`, `createScreen()` |
| Initializers       | init prefix        | `initWebSocket()`, `initGame()` |

### 3.4 Class Naming

- **PascalCase** always
- Name describes the **role**, not the data

```js
// ✅ Good
class ScoreManager { }
class EventBus { }
class UIManager { }

// ❌ Bad
class score_data { }
class event { }
class ui { }
```

### 3.5 Module Structure

Each module follows this consistent pattern:

```js
/**
 * ModuleName — Brief description of what this module does.
 */

// ── Imports ──
import { Something } from '@core/Something.js';

// ── Constants ──
const DEFAULT_VALUE = 100;

// ── Module State ──
let internalState = {};

// ── Public API ──
export function publicMethod() { }

// ── Private Helpers ──
function helperFunction() { }
```

### 3.6 Import Order

Always group imports in this order, separated by blank lines:

```js
// 1. External libraries
import { createServer } from 'fastify';

// 2. Core modules
import { Game } from '@core/Game.js';
import { EventBus } from '@core/EventBus.js';

// 3. Feature modules
import { ScoreManager } from '@modules/score/ScoreManager.js';

// 4. UI components
import { Button } from '@ui/components/Button.js';

// 5. Utilities
import { formatNumber } from '@utils/helpers.js';

// 6. Styles (CSS imports, if any)
import './css/main.css';
```

### 3.7 Comment Style

```js
// ── Section Divider ── (for visual separation in files)

/**
 * JSDoc block for public functions/classes.
 * @param {string} name - Description
 * @returns {number} Description
 */

// Inline comment for explaining "why", not "what"
// We debounce because rapid clicks cause layout thrashing
```

### 3.8 CSS Naming

Use **BEM-lite** convention for component styles:

```css
/* Block */
.score { }

/* Element */
.score__value { }
.score__label { }

/* Modifier */
.score--highlighted { }
.score__value--large { }
```

### 3.9 Module Communication

- **Never import directly between feature modules.** Use the `EventBus` for cross-module communication.
- Core modules (`core/`) can be imported by anyone.
- UI modules (`ui/`) never import from `modules/` — they listen to events.
- Feature modules (`modules/`) never import from `ui/` — they emit events.

```
modules/score  ──emit──▶  EventBus  ──listen──▶  ui/screens/Leaderboard
modules/mining ──emit──▶  EventBus  ──listen──▶  ui/components/Toast
```

### 3.10 Git Conventions

| Type              | Format                                        |
| ----------------- | --------------------------------------------- |
| Branch names      | `feature/score-system`, `fix/leaderboard-bug` |
| Commit messages   | `feat: add score counter`                     |
|                   | `fix: prevent double-click score bug`         |
|                   | `chore: update dependencies`                  |
|                   | `docs: update tech stack`                     |

---

## 4. Architecture Principles

1. **Separation of Concerns** — Game logic (`modules/`) never mixes with rendering (`ui/`) or server code (`server/`).
2. **Event-Driven** — Modules communicate through `EventBus`, not direct imports.
3. **Single Responsibility** — Each file does one thing well.
4. **Configuration Over Code** — Tunable values live in `Config.js`, not hardcoded in logic.
5. **Progressive Enhancement** — Game works without network (offline-first), enhances with WebSocket when available.
6. **Telegram Mini App Ready** — No framework dependencies, ES modules, small bundle, no `window`-only APIs.

---

## 5. What's NOT Included (Yet)

These will be added in future phases:

| Feature          | Phase     |
| ---------------- | --------- |
| Core Gameplay    | Phase 2   |
| UI / HUD         | Phase 3   |
| Leaderboard      | Phase 4   |
| Shop             | Phase 5   |
| Telegram Integration | Phase 6 |
| Database         | Phase 4   |
| Backend API      | Phase 4   |
| WebSocket        | Phase 4   |
