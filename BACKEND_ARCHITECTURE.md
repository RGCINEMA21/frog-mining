# 🐸 Frog Mining — Backend System Architecture

---

## 1. Architecture Overview

### Core Principle

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   FRONTEND (Client)          BACKEND (Server)           │
│   ┌──────────────┐          ┌──────────────────┐        │
│   │ Display only │◀──REST──▶│ Source of Truth   │        │
│   │ Send request │          │ Validate & Process│        │
│   └──────────────┘          └──────────────────┘        │
│                                                         │
│   Client menampilkan data   Server memproses semua       │
│   Client mengirim request   perubahan data               │
│   Client TIDAK menentukan   Server menentukan           │
│   hasil akhir               hasil akhir                  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### System Diagram

```
                    ┌─────────────────┐
                    │   CDN / Edge    │
                    │  (Cloudflare)   │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │   Frontend      │
                    │  (Static Files) │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │   API Gateway   │
                    │  (Rate Limit)   │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
     ┌────────▼───────┐ ┌───▼──────────┐ ┌▼───────────────┐
     │  Auth Service  │ │ Game Service │ │ Payment Service│
     └────────┬───────┘ └───┬──────────┘ └┬───────────────┘
              │              │              │
              └──────────────┼──────────────┘
                             │
                    ┌────────▼────────┐
                    │  Scheduler      │
                    │  (Background)   │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │   Database      │
                    │  (PostgreSQL)   │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │   WebSocket     │
                    │  (Realtime)     │
                    └─────────────────┘
```

---

## 2. Module Architecture

### Module Dependency Graph

```
┌─────────────────────────────────────────────────────────┐
│                    MODULE DEPENDENCIES                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────┐                                        │
│  │    Auth     │──▶ Player                              │
│  └─────────────┘                                        │
│                                                         │
│  ┌─────────────┐                                        │
│  │   Player    │──▶ Score, Diamond, Auto Mining         │
│  └─────────────┘                                        │
│                                                         │
│  ┌─────────────┐                                        │
│  │   Score     │──▶ Leaderboard                         │
│  └─────────────┘                                        │
│                                                         │
│  ┌─────────────┐                                        │
│  │  Diamond    │──▶ Auto Mining, Shop                   │
│  └─────────────┘                                        │
│                                                         │
│  ┌─────────────┐                                        │
│  │ Auto Mining │──▶ Score, Diamond                      │
│  └─────────────┘                                        │
│                                                         │
│  ┌─────────────┐                                        │
│  │ Leaderboard │──▶ Mail (reward distribution)          │
│  └─────────────┘                                        │
│                                                         │
│  ┌─────────────┐                                        │
│  │    Mail     │──▶ Diamond (claim reward)              │
│  └─────────────┘                                        │
│                                                         │
│  ┌─────────────┐                                        │
│  │    Shop     │──▶ Payment, Transaction                │
│  └─────────────┘                                        │
│                                                         │
│  ┌─────────────┐                                        │
│  │   Payment   │──▶ Diamond, Transaction                │
│  └─────────────┘                                        │
│                                                         │
│  ┌─────────────┐                                        │
│  │ Transaction │──▶ (log only, no dependencies)         │
│  └─────────────┘                                        │
│                                                         │
│  ┌─────────────┐                                        │
│  │  Scheduler  │──▶ Auto Mining, Leaderboard, Mail      │
│  └─────────────┘                                        │
│                                                         │
│  ┌─────────────┐                                        │
│  │Notification │──▶ Player (push to client)             │
│  └─────────────┘                                        │
│                                                         │
│  ┌─────────────┐                                        │
│  │    Admin    │──▶ All modules (management)            │
│  └─────────────┘                                        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Module Descriptions

#### 2.1 Authentication Module

```
┌─────────────────────────────────────────────────┐
│              AUTHENTICATION MODULE               │
├─────────────────────────────────────────────────┤
│                                                 │
│  Fungsi:                                        │
│  ├── Verifikasi identitas pemain                │
│  ├── Buat/restore session                       │
│  ├── Generate JWT token                         │
│  ├── Validasi token setiap request              │
│  └── Handle logout / session expiry             │
│                                                 │
│  Input:                                         │
│  ├── Telegram Mini App init data                │
│  └── Username (new player)                      │
│                                                 │
│  Output:                                        │
│  ├── JWT token                                  │
│  ├── Player ID                                  │
│  └── Session data                               │
│                                                 │
│  Dependencies: Player Module                    │
│                                                 │
└─────────────────────────────────────────────────┘
```

#### 2.2 Player Module

```
┌─────────────────────────────────────────────────┐
│               PLAYER MODULE                      │
├─────────────────────────────────────────────────┤
│                                                 │
│  Fungsi:                                        │
│  ├── Buat akun baru                             │
│  ├── Ambil data pemain                          │
│  ├── Update profil (username, foto)             │
│  ├── Kelola status akun (active/banned)         │
│  └── Export/import data untuk sync               │
│                                                 │
│  Data yang dikelola:                            │
│  ├── Player ID                                  │
│  ├── Telegram ID                                │
│  ├── Username                                   │
│  ├── Profile Photo                              │
│  ├── Total Score                                │
│  ├── Total Diamond                              │
│  ├── Joined At                                  │
│  ├── Last Login At                              │
│  └── Account Status                             │
│                                                 │
│  Dependencies: None (core module)               │
│                                                 │
└─────────────────────────────────────────────────┘
```

#### 2.3 Score Module

```
┌─────────────────────────────────────────────────┐
│               SCORE MODULE                       │
├─────────────────────────────────────────────────┤
│                                                 │
│  Fungsi:                                        │
│  ├── Proses tap dari pemain                     │
│  ├── Tambah Score (+1 per tap)                  │
│  ├── Tambah Score dari Auto Mining (+1/detik)   │
│  ├── Validasi Score tidak negatif               │
│  ├── Simpan Score ke database                   │
│  └── Emit event: score:change                   │
│                                                 │
│  Validasi:                                      │
│  ├── newScore >= 0                              │
│  ├── Score hanya naik (kecuali reset)           │
│  └── Rate limit: max 20 taps per detik          │
│                                                 │
│  Dependencies: Player Module                    │
│                                                 │
└─────────────────────────────────────────────────┘
```

#### 2.4 Diamond Module

```
┌─────────────────────────────────────────────────┐
│              DIAMOND MODULE                      │
├─────────────────────────────────────────────────┤
│                                                 │
│  Fungsi:                                        │
│  ├── Kelola saldo Diamond pemain                │
│  ├── Tambah Diamond (dari leaderboard/shop)     │
│  ├── Kurangi Diamond (untuk auto mining)        │
│  ├── Validasi Diamond tidak negatif             │
│  └── Emit event: diamond:change                 │
│                                                 │
│  Sumber Diamond:                                │
│  ├── add(amount, 'leaderboard')                 │
│  └── add(amount, 'shop')                        │
│                                                 │
│  Pengeluaran Diamond:                           │
│  ├── spend(amount, 'auto-mining')               │
│  └── spend(amount, 'future-feature')            │
│                                                 │
│  Validasi:                                      │
│  ├── newDiamond >= 0                            │
│  └── canAfford(cost): diamond >= cost           │
│                                                 │
│  Dependencies: Player Module                    │
│                                                 │
└─────────────────────────────────────────────────┘
```

#### 2.5 Auto Mining Module

```
┌─────────────────────────────────────────────────┐
│            AUTO MINING MODULE                    │
├─────────────────────────────────────────────────┤
│                                                 │
│  Fungsi:                                        │
│  ├── Aktifkan Auto Mining (beli paket)          │
│  ├── Kelola timer durasi                        │
│  ├── Hitung Score per detik                     │
│  ├── Handle offline mining (reconnect)          │
│  ├── Berhenti otomatis saat habis               │
│  └── Validasi: tidak bisa stack                 │
│                                                 │
│  Paket:                                         │
│  ├── Basic:  💎1,000  = 5 jam (18,000 detik)   │
│  └── Premium: 💎5,000 = 24 jam (86,400 detik)  │
│                                                 │
│  Alur:                                          │
│  1. Cek Diamond cukup                           │
│  2. Kurangi Diamond                             │
│  3. Buat sesi Auto Mining                       │
│  4. Mulai timer                                 │
│  5. Setiap detik: Score += 1                    │
│  6. Saat habis: status = inactive               │
│                                                 │
│  Dependencies: Score Module, Diamond Module     │
│                                                 │
└─────────────────────────────────────────────────┘
```

#### 2.6 Leaderboard Module

```
┌─────────────────────────────────────────────────┐
│            LEADERBOARD MODULE                    │
├─────────────────────────────────────────────────┤
│                                                 │
│  Fungsi:                                        │
│  ├── Update ranking saat Score berubah          │
│  ├── Hitung peringkat (ranking algorithm)       │
│  ├── Kelola 3 periode (daily/weekly/monthly)    │
│  ├── Tutup periode saat waktunya                │
│  ├── Distribusi hadiah ke Mail                  │
│  └── Reset Score saat periode berakhir          │
│                                                 │
│  Periode:                                       │
│  ├── Daily:   00:00–23:59 UTC                   │
│  ├── Weekly:  Senin–Minggu                      │
│  └── Monthly: Tanggal 1–terakhir                │
│                                                 │
│  Ranking Algorithm:                             │
│  1. ORDER BY score DESC                         │
│  2. Tie-breaker: timestamp (lebih dulu = lebih  │
│     tinggi)                                     │
│  3. Minimal 1 Score untuk masuk                 │
│                                                 │
│  Hadiah:                                        │
│  ├── #1:  50 Diamond (daily) / 100 (monthly)    │
│  ├── #2:  30 Diamond (daily) / 60 (monthly)     │
│  ├── #3:  20 Diamond (daily) / 40 (monthly)     │
│  └── #4–10: 5–10 Diamond                        │
│                                                 │
│  Dependencies: Score Module, Mail Module        │
│                                                 │
└─────────────────────────────────────────────────┘
```

#### 2.7 Mail Module

```
┌─────────────────────────────────────────────────┐
│               MAIL MODULE                        │
├─────────────────────────────────────────────────┤
│                                                 │
│  Fungsi:                                        │
│  ├── Kirim Mail ke pemain                       │
│  ├── Kelola status Mail                         │
│  ├── Proses claim hadiah                        │
│  ├── Validasi claim (1x only, belum expired)    │
│  └── Handle Mail expiry                         │
│                                                 │
│  Status:                                        │
│  ├── UNCLAIMED → CLAIMED (saat claim)           │
│  ├── UNCLAIMED → EXPIRED (saat expiry)          │
│  └── CLAIMED / EXPIRED (terminal)               │
│                                                 │
│  Validasi Claim:                                │
│  ├── status == UNCLAIMED                        │
│  ├── expiry == null OR expiry > now             │
│  └── Setelah claim: status = CLAIMED            │
│                                                 │
│  Dependencies: Diamond Module                   │
│                                                 │
└─────────────────────────────────────────────────┘
```

#### 2.8 Shop Module

```
┌─────────────────────────────────────────────────┐
│               SHOP MODULE                        │
├─────────────────────────────────────────────────┤
│                                                 │
│  Fungsi:                                        │
│  ├── Kelola produk Diamond                      │
│  ├── Tampilkan daftar produk                    │
│  ├── Kelola status produk                       │
│  ├── Inisiasi pembelian                         │
│  └── Handle konfirmasi pembayaran               │
│                                                 │
│  Produk:                                        │
│  ├── Starter Pack:  💎10  = Rp 5,000            │
│  ├── Basic Pack:    💎50  = Rp 20,000           │
│  ├── Mega Pack:     💎200 = Rp 50,000           │
│  └── Ultimate Pack: 💎500 = Rp 100,000          │
│                                                 │
│  Status Produk:                                 │
│  ├── ACTIVE   → tersedia untuk dibeli           │
│  ├── INACTIVE → tidak ditampilkan               │
│  └── SOLD_OUT → ditampilkan tapi tidak bisa beli│
│                                                 │
│  Dependencies: Payment Module, Diamond Module   │
│                                                 │
└─────────────────────────────────────────────────┘
```

#### 2.9 Payment Module

```
┌─────────────────────────────────────────────────┐
│              PAYMENT MODULE                      │
├─────────────────────────────────────────────────┤
│                                                 │
│  Fungsi:                                        │
│  ├── Inisiasi pembayaran ke gateway             │
│  ├── Terima callback dari gateway               │
│  ├── Verifikasi pembayaran                      │
│  ├── Handle success / failure / cancel          │
│  └── Mencegah duplikasi transaksi               │
│                                                 │
│  Alur:                                          │
│  1. Buat transaksi (status: PENDING)            │
│  2. Redirect ke payment gateway                 │
│  3. Gateway callback: success/fail/cancel       │
│  4. Update status transaksi                     │
│  5. Jika success: tambah Diamond                │
│                                                 │
│  Validasi:                                      │
│  ├── Verifikasi signature dari gateway          │
│  ├── Cek duplikasi (transaction ID unik)        │
│  └── Cek amount sesuai                          │
│                                                 │
│  Dependencies: Diamond Module, Transaction Mdl  │
│                                                 │
└─────────────────────────────────────────────────┘
```

#### 2.10 Transaction Module

```
┌─────────────────────────────────────────────────┐
│            TRANSACTION MODULE                    │
├─────────────────────────────────────────────────┤
│                                                 │
│  Fungsi:                                        │
│  ├── Catat semua transaksi                      │
│  ├── Snapshot harga saat transaksi              │
│  ├── Audit trail untuk debugging                │
│  ├── Query riwayat transaksi                    │
│  └── Laporan untuk admin                        │
│                                                 │
│  Data yang dicatat:                             │
│  ├── Transaction ID                             │
│  ├── Player ID                                  │
│  ├── Product ID                                 │
│  ├── Amount Paid (snapshot)                     │
│  ├── Payment Method                             │
│  ├── Payment Status                             │
│  ├── Transaction Date                           │
│  └── Completed At                               │
│                                                 │
│  Dependencies: None (logging module)            │
│                                                 │
└─────────────────────────────────────────────────┘
```

#### 2.11 Scheduler Module

```
┌─────────────────────────────────────────────────┐
│              SCHEDULER MODULE                    │
├─────────────────────────────────────────────────┤
│                                                 │
│  Fungsi:                                        │
│  ├── Jalankan tugas terjadwal otomatis          │
│  ├── Kelola cron jobs                           │
│  ├── Handle failure & retry                     │
│  └── Log semua aktivitas scheduler              │
│                                                 │
│  Lihat Section 3 untuk detail lengkap.          │
│                                                 │
│  Dependencies: Auto Mining, Leaderboard, Mail   │
│                                                 │
└─────────────────────────────────────────────────┘
```

#### 2.12 Notification Module

```
┌─────────────────────────────────────────────────┐
│            NOTIFICATION MODULE                   │
├─────────────────────────────────────────────────┤
│                                                 │
│  Fungsi:                                        │
│  ├── Kirim notifikasi realtime ke client        │
│  ├── Kelola WebSocket connections               │
│  ├── Broadcast update leaderboard               │
│  ├── Kirim toast/notification ke pemain         │
│  └── Handle reconnect & sync                    │
│                                                 │
│  Tipe Notifikasi:                               │
│  ├── score:change     → Score update            │
│  ├── diamond:change   → Diamond update          │
│  ├── mail:new         → Mail baru               │
│  ├── leaderboard:rank → Ranking berubah         │
│  └── auto:mining:tick → Auto mining update      │
│                                                 │
│  Dependencies: Player Module                    │
│                                                 │
└─────────────────────────────────────────────────┘
```

#### 2.13 Admin Module

```
┌─────────────────────────────────────────────────┐
│               ADMIN MODULE                       │
├─────────────────────────────────────────────────┤
│                                                 │
│  Fungsi:                                        │
│  ├── Dashboard untuk admin                      │
│  ├── Kelola produk Shop                         │
│  ├── Kelola status akun pemain                  │
│  ├── Kirim Mail manual                          │
│  ├── Lihat log sistem                           │
│  ├── Monitor performa                           │
│  └── Handle support request                     │
│                                                 │
│  Akses:                                         │
│  ├── Hanya untuk admin terautentikasi           │
│  ├── Role-based access control                  │
│  └── Semua aksi admin tercatat di log           │
│                                                 │
│  Dependencies: Semua modules                    │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 3. Scheduler Design

### Concept

Scheduler adalah komponen backend yang berjalan di latar belakang (background) dan menjalankan tugas-tugas terjadwal secara otomatis tanpa interaksi manusia.

```
┌─────────────────────────────────────────────────┐
│                SCHEDULER                         │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────────────────────────────────┐        │
│  │  Cron Jobs (jadwal berulang)        │        │
│  │                                     │        │
│  │  ⏰ Setiap detik:                   │        │
│  │     └── Update Auto Mining timer    │        │
│  │                                     │        │
│  │  ⏰ Setiap menit:                   │        │
│  │     └── Bersihkan Mail expired      │        │
│  │                                     │        │
│  │  ⏰ Setiap hari 00:00 UTC:          │        │
│  │     └── Tutup leaderboard harian    │        │
│  │     └── Distribusi hadiah           │        │
│  │     └── Kirim Mail hadiah           │        │
│  │     └── Reset Score harian          │        │
│  │                                     │        │
│  │  ⏰ Setiap Senin 00:00 UTC:         │        │
│  │     └── Tutup leaderboard mingguan  │        │
│  │     └── Distribusi hadiah           │        │
│  │     └── Kirim Mail hadiah           │        │
│  │     └── Reset Score mingguan        │        │
│  │                                     │        │
│  │  ⏰ Setiap tanggal 1 00:00 UTC:     │        │
│  │     └── Tutup leaderboard bulanan   │        │
│  │     └── Distribusi hadiah           │        │
│  │     └── Kirim Mail hadiah           │        │
│  │     └── Reset Score bulanan         │        │
│  │     └── Reset Total Score           │        │
│  │                                     │        │
│  └─────────────────────────────────────┘        │
│                                                 │
│  ┌─────────────────────────────────────┐        │
│  │  Event-Driven Tasks                 │        │
│  │                                     │        │
│  │  📡 Saat pemain reconnect:          │        │
│  │     └── Hitung offline Auto Mining  │        │
│  │                                     │        │
│  │  📡 Saat transaksi success:         │        │
│  │     └── Tambah Diamond              │        │
│  │     └── Kirim Mail konfirmasi       │        │
│  │                                     │        │
│  │  📡 Saat Mail diklaim:              │        │
│  │     └── Tambah Diamond              │        │
│  │                                     │        │
│  └─────────────────────────────────────┘        │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Scheduler Tasks

| Task | Trigger | Action | Frequency |
|------|---------|--------|-----------|
| Auto Mining Update | Every second | Score += 1 per active session | Continuous |
| Mail Cleanup | Every minute | Delete expired unclaimed mail | Hourly |
| Daily Leaderboard Close | 00:00 UTC daily | Rank, distribute rewards, reset | Daily |
| Weekly Leaderboard Close | 00:00 UTC Monday | Rank, distribute rewards, reset | Weekly |
| Monthly Leaderboard Close | 00:00 UTC 1st | Rank, distribute rewards, full reset | Monthly |
| Offline Mining Calc | On reconnect | Calculate score earned while offline | Per reconnect |
| Payment Verification | On callback | Verify payment, add diamond | Per transaction |

### Scheduler Reliability

```
┌─────────────────────────────────────────────────┐
│           SCHEDULER RELIABILITY                  │
├─────────────────────────────────────────────────┤
│                                                 │
│  1. Idempotency                                 │
│     └── Tasks bisa dijalankan ulang tanpa       │
│         efek samping (misal: close leaderboard  │
│         yang sudah ditutup = no-op)             │
│                                                 │
│  2. Retry on Failure                            │
│     └── Jika task gagal, coba lagi 3x dengan    │
│         backoff (1 detik, 5 detik, 30 detik)    │
│                                                 │
│  3. Locking                                     │
│     └── Cegah task berjalan dua kali bersamaan  │
│         (misal: 2 server instance)              │
│                                                 │
│  4. Logging                                     │
│     └── Semua aktivitas scheduler tercatat      │
│                                                 │
│  5. Monitoring                                  │
│     └── Alert jika task gagal berulang kali     │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 4. API Layer Design

### Communication Pattern

```
┌──────────┐    HTTP Request     ┌──────────┐
│ Frontend │────────────────────▶│ Backend  │
│          │◀────────────────────│          │
│          │    HTTP Response    │          │
└──────────┘                     └──────────┘
      │                               │
      │     WebSocket (optional)      │
      │◀══════════════════════════════▶│
      │    Realtime updates           │
```

### API Groups

```
┌─────────────────────────────────────────────────┐
│                 API GROUPS                       │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌──────────────┐  ┌──────────────┐             │
│  │  Auth API    │  │  Player API  │             │
│  │  /auth/*     │  │  /player/*   │             │
│  └──────────────┘  └──────────────┘             │
│                                                 │
│  ┌──────────────┐  ┌──────────────┐             │
│  │  Score API   │  │ Diamond API  │             │
│  │  /score/*    │  │  /diamond/*  │             │
│  └──────────────┘  └──────────────┘             │
│                                                 │
│  ┌──────────────┐  ┌──────────────┐             │
│  │ Auto Mining  │  │ Leaderboard  │             │
│  │   API        │  │    API       │             │
│  │  /mining/*   │  │  /board/*    │             │
│  └──────────────┘  └──────────────┘             │
│                                                 │
│  ┌──────────────┐  ┌──────────────┐             │
│  │   Mail API   │  │   Shop API   │             │
│  │  /mail/*     │  │  /shop/*     │             │
│  └──────────────┘  └──────────────┘             │
│                                                 │
│  ┌──────────────┐  ┌──────────────┐             │
│  │ Payment API  │  │  Admin API   │             │
│  │  /pay/*      │  │  /admin/*    │             │
│  └──────────────┘  └──────────────┘             │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Request/Response Pattern

```
┌─────────────────────────────────────────────────┐
│           STANDARD RESPONSE FORMAT              │
├─────────────────────────────────────────────────┤
│                                                 │
│  Success Response:                              │
│  {                                              │
│    "success": true,                             │
│    "data": { ... },                             │
│    "timestamp": "2025-01-15T10:30:00Z"          │
│  }                                              │
│                                                 │
│  Error Response:                                │
│  {                                              │
│    "success": false,                            │
│    "error": {                                   │
│      "code": "ERR_INSUFFICIENT_DIAMONDS",       │
│      "message": "Diamond tidak cukup"           │
│    },                                           │
│    "timestamp": "2025-01-15T10:30:00Z"          │
│  }                                              │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Authentication Flow

```
┌──────────┐                ┌──────────┐
│ Frontend │                │ Backend  │
└────┬─────┘                └────┬─────┘
     │                           │
     │  1. POST /auth/login      │
     │  { username, telegramData }│
     │──────────────────────────▶│
     │                           │ 2. Verifikasi
     │                           │    Telegram data
     │                           │    Buat/restore player
     │                           │    Generate JWT
     │  3. { token, player }     │
     │◀──────────────────────────│
     │                           │
     │  4. GET /player/me        │
     │  Authorization: Bearer JWT│
     │──────────────────────────▶│
     │                           │ 5. Validasi JWT
     │                           │    Ambil data player
     │  6. { player data }       │
     │◀──────────────────────────│
     │                           │
```

---

## 5. Security Architecture

### Defense Layers

```
┌─────────────────────────────────────────────────┐
│              SECURITY LAYERS                     │
├─────────────────────────────────────────────────┤
│                                                 │
│  Layer 1: Network                               │
│  ├── HTTPS everywhere                           │
│  ├── CORS policy                                │
│  └── Rate limiting                              │
│                                                 │
│  Layer 2: Authentication                        │
│  ├── JWT token validation                       │
│  ├── Token expiry                               │
│  └── Session management                         │
│                                                 │
│  Layer 3: Authorization                         │
│  ├── Player can only access own data            │
│  ├── Admin role for admin endpoints             │
│  └── No cross-player data access                │
│                                                 │
│  Layer 4: Validation                            │
│  ├── All input validated server-side            │
│  ├── Schema validation                          │
│  └── Business rule validation                   │
│                                                 │
│  Layer 5: Anti-Cheat                            │
│  ├── Rate limiting (tap per second)             │
│  ├── Impossible values rejected                 │
│  └── Pattern detection                          │
│                                                 │
│  Layer 6: Audit                                 │
│  ├── All changes logged                         │
│  ├── Admin actions logged                       │
│  └── Error tracking                             │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Anti-Cheat Rules

| Cheat Attempt | Detection | Response |
|---------------|-----------|----------|
| Tap terlalu cepat | Rate limit: max 20/detik | Reject excess taps |
| Score manipulasi | Server hitung sendiri | Ignore client Score |
| Diamond hack | Server validasi balance | Reject, log attempt |
| Double claim mail | Status check | Reject, log attempt |
| Auto Mining exploit | Timer validation | Reject, log attempt |
| Payment bypass | Gateway verification | Reject, no Diamond |

### Validation Rules (Server-Side)

```
SETIAP REQUEST HARUS DIVALIDASI:

1. Token valid?
   └── Tidak → 401 Unauthorized

2. Player ID valid?
   └── Tidak → 403 Forbidden

3. Data valid?
   └── Tidak → 400 Bad Request

4. Bisnis rules valid?
   └── Tidak → 422 Unprocessable

5. Rate limit OK?
   └── Tidak → 429 Too Many Requests

6. SEMUA SCORE/DIAMOND CHANGES:
   └── Diproses oleh server
   └── Bukan dari client
```

---

## 6. Logging System

### Log Categories

```
┌─────────────────────────────────────────────────┐
│                LOG CATEGORIES                    │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────────────────────────────────┐        │
│  │  AUTH LOGS                          │        │
│  │  ├── Player login                   │        │
│  │  ├── Player logout                  │        │
│  │  ├── Session created                │        │
│  │  ├── Session expired                │        │
│  │  └── Login failed                   │        │
│  └─────────────────────────────────────┘        │
│                                                 │
│  ┌─────────────────────────────────────┐        │
│  │  GAME LOGS                          │        │
│  │  ├── Score change (tap)             │        │
│  │  ├── Score change (auto mining)     │        │
│  │  ├── Score reset (monthly)          │        │
│  │  ├── Diamond add (leaderboard)      │        │
│  │  ├── Diamond add (shop)             │        │
│  │  ├── Diamond spend (auto mining)    │        │
│  │  ├── Auto Mining activated          │        │
│  │  ├── Auto Mining deactivated        │        │
│  │  ├── Mail sent                      │        │
│  │  ├── Mail claimed                   │        │
│  │  └── Mail expired                   │        │
│  └─────────────────────────────────────┘        │
│                                                 │
│  ┌─────────────────────────────────────┐        │
│  │  PAYMENT LOGS                       │        │
│  │  ├── Transaction created            │        │
│  │  ├── Payment initiated              │        │
│  │  ├── Payment success                │        │
│  │  ├── Payment failed                 │        │
│  │  ├── Payment cancelled              │        │
│  │  └── Payment refunded               │        │
│  └─────────────────────────────────────┘        │
│                                                 │
│  ┌─────────────────────────────────────┐        │
│  │  SYSTEM LOGS                        │        │
│  │  ├── Scheduler task start           │        │
│  │  ├── Scheduler task complete        │        │
│  │  ├── Scheduler task failed          │        │
│  │  ├── Database error                 │        │
│  │  ├── WebSocket connection           │        │
│  │  └── Rate limit triggered           │        │
│  └─────────────────────────────────────┘        │
│                                                 │
│  ┌─────────────────────────────────────┐        │
│  │  ADMIN LOGS                         │        │
│  │  ├── Admin login                    │        │
│  │  ├── Product created/updated        │        │
│  │  ├── Player banned/unbanned         │        │
│  │  ├── Manual mail sent               │        │
│  │  └── Config changed                 │        │
│  └─────────────────────────────────────┘        │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Log Format

```
{
  "timestamp": "2025-01-15T10:30:00Z",
  "level": "INFO",
  "category": "GAME",
  "action": "score_change",
  "playerId": "uuid-xxxx",
  "details": {
    "source": "tap",
    "amount": 1,
    "newScore": 12450
  },
  "ip": "192.168.1.1"
}
```

---

## 7. Scalability Design

### Architecture Principles for Scale

```
┌─────────────────────────────────────────────────┐
│            SCALABILITY PRINCIPLES                │
├─────────────────────────────────────────────────┤
│                                                 │
│  1. Stateless Services                          │
│     └── Setiap request bisa dilayani oleh       │
│         server manapun (tidak ada session local)│
│                                                 │
│  2. Horizontal Scaling                          │
│     └── Tambah server instance saat load naik   │
│                                                 │
│  3. Database Optimization                       │
│     └── Index, caching, connection pooling      │
│                                                 │
│  4. Async Processing                            │
│     └── Tugas berat (leaderboard calc)          │
│         diproses di background                  │
│                                                 │
│  5. Modular Design                              │
│     └── Fitur baru = modul baru, tidak ubah     │
│         arsitektur utama                        │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Future Feature Integration

| Fitur | Modul Baru | Dampak Arsitektur |
|-------|-----------|-------------------|
| Achievement | `AchievementModule` | Tambah event listener |
| Event | `EventModule` | Tambah scheduler task |
| Referral | `ReferralModule` | Tambah relasi Player |
| Daily Login | `DailyLoginModule` | Tambah scheduler task |
| Skin Katak | `SkinModule` | Tambah data Player |
| Multi-language | `I18nModule` | Frontend only |
| Telegram Mini App | `TelegramModule` | Tambah auth provider |
| Payment Gateway Baru | `PaymentProviderX` | Tambah di Payment module |

### Adding a New Feature

```
Untuk menambah fitur baru:

1. Buat modul baru di /modules/[feature]/
2. Definisikan API endpoints
3. Tambahkan relasi database jika perlu
4. Tambahkan scheduler task jika perlu
5. Emit events jika perlu
6. Tidak mengubah modul yang sudah ada

Contoh menambah "Achievement":
  modules/
  ├── achievement/        ← MODUL BARU
  │   ├── AchievementService.js
  │   ├── AchievementRoutes.js
  │   └── achievements.json (config)
  │
  Tidak mengubah:
  ├── score/
  ├── diamond/
  ├── leaderboard/
  └── (semua modul existing tetap sama)
```

---

## 8. Module Summary

### Quick Reference

| Module | Responsibility | Dependencies |
|--------|---------------|-------------|
| **Auth** | Verifikasi identitas, JWT, session | Player |
| **Player** | Kelola akun pemain | None (core) |
| **Score** | Proses tap, validasi Score | Player |
| **Diamond** | Kelola saldo Diamond | Player |
| **Auto Mining** | Timer, offline mining | Score, Diamond |
| **Leaderboard** | Ranking, distribusi hadiah | Score, Mail |
| **Mail** | Kirim/claim hadiah | Diamond |
| **Shop** | Produk Diamond | Payment, Diamond |
| **Payment** | Verifikasi pembayaran | Diamond, Transaction |
| **Transaction** | Audit trail | None (logging) |
| **Scheduler** | Tugas terjadwal | Auto Mining, Leaderboard, Mail |
| **Notification** | Realtime updates | Player |
| **Admin** | Dashboard management | All |

### Data Flow Summary

```
Player taps frog
    │
    ▼
Score Module: validates +1
    │
    ├──▶ Player.totalScore += 1
    ├──▶ Leaderboard entry updated
    ├──▶ Notification: score:change
    └──▶ Log: score_change

Scheduler: daily close
    │
    ▼
Leaderboard Module: calculate ranks
    │
    ├──▶ Determine top N players
    ├──▶ Calculate diamond rewards
    ├──▶ Mail Module: send reward mails
    ├──▶ Score Module: reset daily scores
    └──▶ Log: leaderboard_closed

Player claims mail
    │
    ▼
Mail Module: validate claim
    │
    ├──▶ Diamond Module: add diamonds
    ├──▶ Notification: diamond:change
    └──▶ Log: mail_claimed
```
