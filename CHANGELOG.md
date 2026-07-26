# 🐸 Frog Mining — Changelog

All notable changes to this project will be documented in this file.

---

## [v0.2.0] — 2026-07-26

### Sprint 8 — Core System Testing & Stabilization

#### Fixed
- Floating +1 text memory leak on rapid taps
- AudioContext not resuming after browser tab switch
- Leaderboard player position not showing for unranked players
- Mail claim validation for expired mails
- Auto Mining offline calculation accuracy

#### Optimized
- Bundle size reduced to 196KB (15.2KB JS gzipped)
- Animation performance improved to consistent 60fps
- localStorage operations batched for better performance
- Memory cleanup on screen transitions

#### Changed
- Header now shows unread mail count badge
- Error messages made more descriptive
- Responsive breakpoints refined for better mobile support
- Loading states added for async operations

---

## [v0.1.0] — 2026-07-25

### Sprint 1-7 — Core Development

#### Added
- **Account System** — Player registration, auto-login, session management
- **Tap & Score** — Core gameplay with bounce animation, floating +1, sound effects
- **Auto Mining** — Diamond-based auto scoring with timer and offline calculation
- **Leaderboard** — Daily/Weekly/Monthly with ranking and reward distribution
- **Mail System** — Inbox, claim rewards, filters, expiry management
- **Sound System** — Web Audio API with tap, reward, and error sounds
- **Design System** — CSS variables, consistent theming, responsive layout

#### Architecture
- Modular ES modules with Vite build system
- Event-driven architecture with EventBus
- localStorage persistence with account-based keys
- Centralized configuration in Config.js
- Reusable UI components (Button, Card, Modal, Popup, etc.)

#### Documentation
- TECHNICAL_SPECIFICATION.md — Master reference
- DESIGN_SYSTEM.md — Visual standards
- GAME_RULES.md — Official rules
- BACKEND_ARCHITECTURE.md — Server design
- API_SPECIFICATION.md — API standards
- DATABASE_SCHEMA.md — Database design
- DATA_MODEL.md — Entity relationships
- UIUX_DESIGN.md — Design system
- SYSTEM_FLOW.md — User journeys
- TESTING.md — Test results
