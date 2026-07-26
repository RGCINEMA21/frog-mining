# 🐸 Frog Mining — Technical Specification

> **Dokumen ini menjadi acuan utama seluruh implementasi Frog Mining.**
> Semua kode harus mengikuti dokumen ini. Tidak boleh diubah tanpa persetujuan pengguna.

---

## 1. Document Hierarchy

```
┌─────────────────────────────────────────────────────────┐
│              DOCUMENT HIERARCHY (Sumber Kebenaran)       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. TECHNICAL_SPECIFICATION.md  ← DOKUMEN INI           │
│     └── Master reference untuk semua implementasi       │
│                                                         │
│  2. GAME_RULES.md                                          │
│     └── Aturan resmi gameplay                            │
│                                                         │
│  3. BACKEND_ARCHITECTURE.md                               │
│     └── Arsitektur backend, modul, scheduler             │
│                                                         │
│  4. API_SPECIFICATION.md                                  │
│     └── Standar API, request/response, error             │
│                                                         │
│  5. DATABASE_SCHEMA.md                                    │
│     └── Struktur database, relasi, query                 │
│                                                         │
│  6. TECH_STACK.md                                         │
│     └── Keputusan teknologi, coding standards            │
│                                                         │
│  7. DATA_MODEL.md                                         │
│     └── Entity design, relationships                     │
│                                                         │
│  8. UIUX_DESIGN.md                                        │
│     └── Design system, colors, components                │
│                                                         │
│  9. SYSTEM_FLOW.md                                        │
│     └── User journeys, game flows                         │
│                                                         │
│  Semua dokumen di atas TIDAK BOLEH diubah tanpa          │
│  persetujuan pengguna.                                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Implementation Roadmap

### Phase Order (Wajib)

```
┌─────────────────────────────────────────────────────────┐
│              IMPLEMENTATION PHASES                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  PHASE 1: Project Setup                                 │
│  ├── Buat project structure                             │
│  ├── Install dependencies                               │
│  ├── Setup build tool (Vite)                            │
│  ├── Setup linting & formatting                         │
│  └── Dokumentasi: TECH_STACK.md                         │
│                                                         │
│  PHASE 2: Frontend Foundation                           │
│  ├── HTML shell + responsive meta                       │
│  ├── CSS architecture (variables, reset, base)          │
│  ├── JS module system (ES modules)                      │
│  ├── Core modules (Game, EventBus, Config)              │
│  └── Dokumentasi: UIUX_DESIGN.md                        │
│                                                         │
│  PHASE 3: Backend Foundation                            │
│  ├── Setup Node.js + Fastify                            │
│  ├── Project structure server                           │
│  ├── Database connection (Prisma)                       │
│  ├── Error handling middleware                           │
│  └── Dokumentasi: BACKEND_ARCHITECTURE.md               │
│                                                         │
│  PHASE 4: Database                                      │
│  ├── Buat schema Prisma                                 │
│  ├── Jalankan migration                                 │
│  ├── Seed data                                          │
│  └── Dokumentasi: DATABASE_SCHEMA.md                    │
│                                                         │
│  PHASE 5: Authentication                                │
│  ├── Login flow (Telegram / username)                   │
│  ├── JWT generation & validation                        │
│  ├── Session management                                 │
│  ├── Auth middleware                                     │
│  └── Dokumentasi: API_SPECIFICATION.md                  │
│                                                         │
│  PHASE 6: Gameplay                                      │
│  ├── Score system                                       │
│  ├── Tap mechanics                                      │
│  ├── Score persistence                                  │
│  ├── Basic UI (frog + score display)                    │
│  └── Dokumentasi: GAME_RULES.md                         │
│                                                         │
│  PHASE 7: Auto Mining                                   │
│  ├── Timer system                                       │
│  ├── Diamond spend                                      │
│  ├── Offline mining calculation                         │
│  ├── Status display                                     │
│  └── Dokumentasi: GAME_RULES.md                         │
│                                                         │
│  PHASE 8: Leaderboard                                   │
│  ├── Daily/Weekly/Monthly seasons                       │
│  ├── Ranking algorithm                                  │
│  ├── Reward distribution                                │
│  ├── Leaderboard UI                                     │
│  └── Dokumentasi: SYSTEM_FLOW.md                        │
│                                                         │
│  PHASE 9: Mail                                          │
│  ├── Mail system                                        │
│  ├── Claim mechanics                                    │
│  ├── Mail UI                                            │
│  └── Dokumentasi: SYSTEM_FLOW.md                        │
│                                                         │
│  PHASE 10: Shop                                         │
│  ├── Product display                                    │
│  ├── Purchase flow                                      │
│  ├── Shop UI                                            │
│  └── Dokumentasi: SYSTEM_FLOW.md                        │
│                                                         │
│  PHASE 11: Payment                                      │
│  ├── Payment gateway integration                        │
│  ├── Transaction recording                              │
│  ├── Payment verification                               │
│  └── Dokumentasi: API_SPECIFICATION.md                  │
│                                                         │
│  PHASE 12: Admin Panel                                  │
│  ├── Admin dashboard                                    │
│  ├── Player management                                  │
│  ├── Product management                                 │
│  ├── Mail management                                    │
│  └── Dokumentasi: BACKEND_ARCHITECTURE.md               │
│                                                         │
│  PHASE 13: Testing                                      │
│  ├── Functional testing                                 │
│  ├── Validation testing                                 │
│  ├── Error handling testing                             │
│  ├── Mobile responsive testing                          │
│  ├── Performance testing                                │
│  └── Security testing                                   │
│                                                         │
│  PHASE 14: Production Release                           │
│  ├── Environment setup                                  │
│  ├── Deployment configuration                           │
│  ├── Monitoring setup                                   │
│  ├── Documentation final                                │
│  └── Release checklist                                  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Phase Dependencies

```
Phase 1  (Project Setup)
    │
    ▼
Phase 2  (Frontend Foundation) ──────────┐
    │                                     │
    ▼                                     │
Phase 3  (Backend Foundation)            │
    │                                     │
    ▼                                     │
Phase 4  (Database)                      │
    │                                     │
    ▼                                     │
Phase 5  (Authentication)                │
    │                                     │
    ├──▶ Phase 6  (Gameplay) ◀───────────┘
    │         │
    │         ▼
    │    Phase 7  (Auto Mining)
    │         │
    │         ▼
    ├──▶ Phase 8  (Leaderboard)
    │         │
    │         ▼
    ├──▶ Phase 9  (Mail)
    │         │
    │         ▼
    ├──▶ Phase 10 (Shop)
    │         │
    │         ▼
    │    Phase 11 (Payment)
    │         │
    │         ▼
    │    Phase 12 (Admin Panel)
    │         │
    │         ▼
    │    Phase 13 (Testing)
    │         │
    │         ▼
    └──▶ Phase 14 (Production Release)
```

---

## 3. Coding Rules

### Code Quality Standards

```
┌─────────────────────────────────────────────────────────┐
│                 CODING RULES                             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ✅ CLEAN CODE                                          │
│  ├── Kode harus bersih dan mudah dibaca                 │
│  ├── Hindari magic numbers                              │
│  ├── Gunakan nama variabel yang deskriptif              │
│  └── Fungsi harus singkat dan fokus                     │
│                                                         │
│  ✅ MODULAR                                              │
│  ├── Satu modul = satu tanggung jawab                   │
│  ├── Gunakan ES modules (import/export)                 │
│  ├── Komunikasi antar modul via EventBus                │
│  └── Jangan import antar feature module langsung        │
│                                                         │
│  ✅ READABLE                                             │
│  ├── Ikuti naming conventions                           │
│  ├── Gunakan komentar untuk menjelaskan "why"           │
│  ├── Struktur file yang konsisten                       │
│  └── Format konsisten (Prettier)                        │
│                                                         │
│  ✅ TESTABLE                                             │
│  ├── Fungsi murni (pure functions) jika mungkin         │
│  ├── Dependency injection untuk testing                 │
│  ├── Pisahkan logic dari I/O                            │
│  └── Buat test untuk setiap fitur                       │
│                                                         │
│  ✅ MAINTAINABLE                                         │
│  ├── Hindari duplikasi (DRY)                            │
│  ├── Gunakan constants untuk magic values               │
│  ├── Documentation untuk setiap modul                   │
│  └── Version control untuk setiap perubahan             │
│                                                         │
│  ✅ SECURE                                               │
│  ├── Validasi semua input di server                     │
│  ├── Jangan信任 client data                              │
│  ├── Gunakan parameterized queries                      │
│  └── Rate limiting untuk anti-abuse                     │
│                                                         │
│  ✅ PERFORMANT                                           │
│  ├── Hindari query N+1                                  │
│  ├── Gunakan index database                             │
│  ├── Cache data yang sering diakses                     │
│  └── Lazy loading untuk UI                              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Naming Conventions (from TECH_STACK.md)

| Type | Convention | Example |
|------|-----------|---------|
| JS Files (Class) | PascalCase.js | `ScoreManager.js` |
| JS Files (util) | camelCase.js | `eventBus.js` |
| CSS Files | kebab-case.css | `game-screen.css` |
| Variables | camelCase | `scoreCount`, `isRunning` |
| Constants | UPPER_SNAKE_CASE | `MAX_SCORE`, `API_URL` |
| Classes | PascalCase | `ScoreManager`, `EventBus` |
| Functions | camelCase | `calculateScore()` |
| CSS Classes | BEM-lite | `.score__value--large` |

### Module Structure

```
Setiap modul harus mengikuti struktur ini:

src/modules/[feature]/
├── [Feature]Manager.js    # Main class
├── [feature]Events.js     # Event constants (optional)
└── [feature]Utils.js      # Helper functions (optional)

Server modules:
server/
├── routes/[feature].js    # API endpoints
├── services/[feature]Service.js  # Business logic
└── (shared via Prisma schema)
```

---

## 4. Feature Implementation Standard

### Template untuk Setiap Fitur Baru

```
┌─────────────────────────────────────────────────────────┐
│          FEATURE IMPLEMENTATION TEMPLATE                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. TUJUAN                                              │
│     ├── Apa yang fitur ini lakukan                      │
│     ├── Mengapa fitur ini dibutuhkan                     │
│     └── Bagaimana fitur ini terhubung dengan yang lain  │
│                                                         │
│  2. DEPENDENSI                                          │
│     ├── Modul apa yang harus ada sebelumnya             │
│     ├── Database schema yang dibutuhkan                 │
│     └── API endpoints yang diperlukan                   │
│                                                         │
│  3. STRUKTUR FOLDER                                     │
│     ├── Frontend: src/modules/[feature]/                │
│     ├── Backend: server/routes + services               │
│     └── Database: schema.prisma updates                 │
│                                                         │
│  4. PENJELASAN ALUR                                     │
│     ├── Flow diagram                                    │
│     ├── State transitions                               │
│     └── Error handling                                  │
│                                                         │
│  5. IMPLEMENTASI                                        │
│     ├── Frontend code                                   │
│     ├── Backend code                                    │
│     └── Database migrations                             │
│                                                         │
│  6. TESTING                                             │
│     ├── Unit tests                                      │
│     ├── Integration tests                               │
│     └── Manual testing checklist                        │
│                                                         │
│  7. DOKUMENTASI                                         │
│     ├── Update relevan dokumen existing                 │
│     └── Catatan pengembangan                            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 5. Version Control

### Semantic Versioning

```
Format: MAJOR.MINOR.PATCH

Contoh:
  v0.1.0  → Phase 1 selesai (Project Setup)
  v0.2.0  → Phase 2 selesai (Frontend Foundation)
  v0.3.0  → Phase 3 selesai (Backend Foundation)
  v0.4.0  → Phase 4 selesai (Database)
  v0.5.0  → Phase 5 selesai (Authentication)
  v0.6.0  → Phase 6 selesai (Gameplay)
  v0.7.0  → Phase 7 selesai (Auto Mining)
  v0.8.0  → Phase 8 selesai (Leaderboard)
  v0.9.0  → Phase 9 selesai (Mail)
  v0.10.0 → Phase 10 selesai (Shop)
  v0.11.0 → Phase 11 selesai (Payment)
  v0.12.0 → Phase 12 selesai (Admin Panel)
  v0.13.0 → Phase 13 selesai (Testing)
  v1.0.0  → Phase 14 selesai (Production Release)

Rules:
  MAJOR → Breaking changes (v1 → v2)
  MINOR → New features (backward compatible)
  PATCH → Bug fixes
```

### Changelog Format

```
CHANGELOG.md:

## [v0.6.0] - 2025-01-15

### Added
- Score system (+1 per tap)
- Tap mechanics with bounce animation
- Score display UI
- Score persistence to server

### Changed
- Updated Game.js to include ScoreManager

### Fixed
- Score not syncing after reconnect

### Testing
- ✅ Tap 100 times: score = 100
- ✅ Refresh page: score preserved
- ✅ Mobile responsive: score readable
```

### Git Conventions

| Type | Format | Example |
|------|--------|---------|
| Branch | `feature/[name]` | `feature/score-system` |
| Branch | `fix/[name]` | `fix/sync-score` |
| Branch | `chore/[name]` | `chore/update-deps` |
| Commit | `feat: add score counter` | New feature |
| Commit | `fix: prevent double-tap` | Bug fix |
| Commit | `chore: update dependencies` | Maintenance |
| Commit | `docs: update tech spec` | Documentation |
| Commit | `test: add score tests` | Testing |

---

## 6. Testing Requirements

### Testing Checklist per Feature

```
Sebelum fitur dianggap SELESAI, harus lalu semua test:

┌─────────────────────────────────────────────────────────┐
│                 TESTING CHECKLIST                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ✅ FUNCTIONAL TESTING                                  │
│  ├── Fitur berfungsi sesuai spesifikasi                 │
│  ├── Semua happy path berhasil                          │
│  ├── Edge cases tertangani                              │
│  └── Error cases tertangani                             │
│                                                         │
│  ✅ VALIDATION TESTING                                  │
│  ├── Input valid diterima                               │
│  ├── Input invalid ditolak                              │
│  ├── Error message jelas                                │
│  └── Server-side validation aktif                       │
│                                                         │
│  ✅ ERROR HANDLING TESTING                              │
│  ├── Network error tertangani                           │
│  ├── Server error tertangani                            │
│  ├── Rate limit berfungsi                              │
│  └── Graceful degradation                               │
│                                                         │
│  ✅ MOBILE RESPONSIVE TESTING                           │
│  ├── Layout benar di 375px                              │
│  ├── Layout benar di 428px                              │
│  ├── Touch targets >= 44px                              │
│  └── Text readable tanpa zoom                           │
│                                                         │
│  ✅ PERFORMANCE TESTING                                 │
│  ├── First Contentful Paint < 2s                        │
│  ├── Time to Interactive < 3s                           │
│  ├── Tap response < 100ms                               │
│  └── Memory usage stable                                │
│                                                         │
│  ✅ SECURITY TESTING                                    │
│  ├── Auth bypass ditolak                                │
│  ├── Invalid token ditolak                              │
│  ├── SQL injection ditolak                              │
│  └── Rate limiting aktif                                │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Test Types

| Type | Scope | Tools | Priority |
|------|-------|-------|----------|
| Unit Test | Fungsi individual | Vitest | High |
| Integration Test | Modul interaction | Vitest + MSW | High |
| E2E Test | Full user flow | Playwright | Medium |
| Manual Test | UI/UX feel | Browser/Device | High |
| Performance Test | Load/stress | Lighthouse | Medium |

---

## 7. Documentation Requirements

### Per-Module Documentation

```
Setiap modul harus punya dokumentasi:

┌─────────────────────────────────────────────────────────┐
│          MODULE DOCUMENTATION TEMPLATE                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ## [Module Name]                                       │
│                                                         │
│  ### Fungsi Modul                                       │
│  Apa yang modul ini lakukan                            │
│                                                         │
│  ### Cara Kerja                                        │
│  Alur kerja modul step-by-step                         │
│                                                         │
│  ### Dependensi                                        │
│  Modul lain yang dibutuhkan                            │
│                                                         │
│  ### Cara Integrasi                                    │
│  Cara menggunakan modul ini di tempat lain             │
│                                                         │
│  ### API (jika ada)                                    │
│  Fungsi/method yang tersedia                           │
│                                                         │
│  ### Events (jika ada)                                 │
│  Event yang di-emit dan di-listen                      │
│                                                         │
│  ### Catatan Pengembangan                              │
│  Hal-hal yang perlu diperhatikan                        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Documentation Files

| File | Purpose | Updated When |
|------|---------|-------------|
| `TECHNICAL_SPECIFICATION.md` | Master reference | Architecture changes |
| `GAME_RULES.md` | Aturan game | Rule changes |
| `BACKEND_ARCHITECTURE.md` | Arsitektur backend | Module changes |
| `API_SPECIFICATION.md` | Standar API | Endpoint changes |
| `DATABASE_SCHEMA.md` | Struktur database | Schema changes |
| `TECH_STACK.md` | Tech decisions | Tech changes |
| `DATA_MODEL.md` | Entity design | Entity changes |
| `UIUX_DESIGN.md` | Design system | Design changes |
| `SYSTEM_FLOW.md` | User journeys | Flow changes |
| `CHANGELOG.md` | Version history | Every release |
| `README.md` | Project overview | Major changes |

---

## 8. Implementation Rules

### Critical Rules

```
┌─────────────────────────────────────────────────────────┐
│              CRITICAL IMPLEMENTATION RULES               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ❌ TIDAK BOLEH                                         │
│  ├── Melompati urutan phase                             │
│  ├── Mengubah dokumen tanpa persetujuan                 │
│  ├── Membuat fitur tanpa dokumentasi                    │
│  ├── Push code tanpa testing                            │
│  ├── Hardcode values yang ada di Config                 │
│  ├── Trust client data tanpa validasi server            │
│  └── Membuat semua sekaligus                            │
│                                                         │
│  ✅ WAJIB                                               │
│  ├── Selesaikan phase sebelum lanjut                    │
│  ├── Test setiap fitur sebelum commit                   │
│  ├── Dokumentasi setiap modul                           │
│  ├── Update CHANGELOG setiap release                    │
│  ├── Review kode sebelum merge                          │
│  ├── Gunakan branch untuk setiap fitur                  │
│  └── Commit message sesuai convention                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Per-Phase Workflow

```
Untuk setiap phase:

1. Baca dokumentasi terkait
   └── Pastikan paham requirement

2. Buat branch baru
   └── feature/phase-X-[name]

3. Implementasi
   └── Ikuti coding rules

4. Testing
   └── Jalankan semua test

5. Dokumentasi
   └── Update/add documentation

6. Commit
   └── Follow git conventions

7. Review
   └── Pastikan sesuai spesifikasi

8. Merge ke main
   └── Phase dianggap selesai

9. Tag version
   └── v0.X.0

10. Lanjut ke phase berikutnya
```

---

## 9. Security Checklist

### Security Requirements

```
┌─────────────────────────────────────────────────────────┐
│              SECURITY CHECKLIST                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ✅ AUTHENTICATION                                      │
│  ├── JWT token untuk semua endpoint terproteksi         │
│  ├── Token expiry 24 jam                                │
│  ├── Token validation di setiap request                 │
│  └── Session management                                 │
│                                                         │
│  ✅ AUTHORIZATION                                       │
│  ├── Player hanya bisa akses data sendiri               │
│  ├── Admin role untuk admin endpoints                   │
│  └── Rate limiting aktif                                │
│                                                         │
│  ✅ VALIDATION                                          │
│  ├── Semua input divalidasi server-side                 │
│  ├── Score hanya dihitung server                        │
│  ├── Diamond hanya dihitung server                      │
│  └── Schema validation untuk semua data                 │
│                                                         │
│  ✅ ANTI-CHEAT                                          │
│  ├── Rate limit: max 20 taps/detik                      │
│  ├── Impossible values ditolak                          │
│  ├── Pattern detection                                  │
│  └── Server-side state management                       │
│                                                         │
│  ✅ DATA PROTECTION                                     │
│  ├── HTTPS everywhere                                   │
│  ├── Sensitive data encrypted                           │
│  ├── Password/token tidak di-log                        │
│  └── Audit trail untuk semua perubahan                  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 10. Performance Requirements

### Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| First Contentful Paint | < 2s | Lighthouse |
| Time to Interactive | < 3s | Lighthouse |
| Largest Contentful Paint | < 2.5s | Lighthouse |
| Tap Response | < 100ms | Manual test |
| API Response Time | < 200ms | Server logs |
| Bundle Size | < 50KB (gzipped) | Build output |
| Memory Usage | < 50MB | Chrome DevTools |

### Optimization Rules

```
FRONTEND:
├── Gunakan ES modules (tree shaking)
├── Lazy load screens (hanya load saat dibutuhkan)
├── CSS pakai custom properties (bukan framework)
├── Animasi pakai transform/opacity saja
├── Hindari layout thrashing
└── Cache API responses

BACKEND:
├── Index database untuk query頻繁
├── Connection pooling
├── Rate limiting
├── Response caching (leaderboard, products)
├── Async processing untuk tugas berat
└── Database query optimization (avoid N+1)
```

---

## 11. Deployment Checklist

### Pre-Deployment

```
□ Semua test lulus
□ Build production berhasil
□ Documentation ter-update
□ CHANGELOG ter-update
□ Version tag dibuat
□ Environment variables configured
□ Database migrations applied
□ SSL certificate active
□ Domain configured
□ CDN configured
```

### Production Environment

```
FRONTEND:
├── Hosting: Cloudflare Pages
├── Build command: npm run build
├── Output directory: dist
└── Environment: production

BACKEND:
├── Hosting: Railway
├── Runtime: Node.js 20 LTS
├── Port: 3001 (configurable)
└── Environment: production

DATABASE:
├── Provider: Supabase (PostgreSQL)
├── Connection: Prisma
├── SSL: Required
└── Backups: Daily
```

---

## 12. Current Project Status

### Completed Phases

| Phase | Status | Version |
|-------|--------|---------|
| Phase 1: Project Setup | ✅ Done | v0.1.0 |
| Phase 2: Frontend Foundation | ✅ Done | v0.2.0 |
| Phase 3: Gameplay Rules | ✅ Done | — |
| Phase 4: Data Model | ✅ Done | — |
| Phase 5: UI/UX Design | ✅ Done | — |
| Phase 6: System Flow | ✅ Done | — |
| Phase 7: Game Rules | ✅ Done | — |
| Phase 8: Backend Architecture | ✅ Done | — |
| Phase 9: API Specification | ✅ Done | — |
| Phase 10: Database Schema | ✅ Done | — |
| Phase 11: Technical Spec | ✅ Done | — (this document) |

### Next Steps

| Phase | Status | Dependencies |
|-------|--------|-------------|
| Phase 12: UI Implementation | ⏳ Pending | Phase 2, 5 |
| Phase 13: Backend Implementation | ⏳ Pending | Phase 3, 4, 8, 10 |
| Phase 14: Integration | ⏳ Pending | Phase 12, 13 |
| Phase 15: Testing | ⏳ Pending | Phase 14 |
| Phase 16: Production Release | ⏳ Pending | Phase 15 |

---

## 13. Quick Reference

### Tech Stack

```
Frontend:  Vanilla JS (ES2020+) + Vite 5
CSS:       Vanilla CSS + Custom Properties
Backend:   Node.js 20 LTS + Fastify 4
Database:  PostgreSQL 16 + Prisma ORM
Realtime:  WebSocket (ws)
Auth:      Telegram Init Data + JWT
Deploy:    Cloudflare Pages + Railway + Supabase
```

### Key Rules

```
1. Score: +1 per tap, +1 per detik (auto mining), no cap
2. Diamond: dari leaderboard/shop, untuk auto mining
3. Auto Mining: 💎1K=5jam, 💎5K=24jam, tidak stack
4. Leaderboard: daily/weekly/monthly, reset bulanan
5. Mail: claim 1x, bisa expiry
6. Payment: verified dulu, baru Diamond masuk
7. Security: server = source of truth, client = display only
```

### Documentation Files

```
9 files, 5,586+ lines of documentation
Ready for implementation!
```
