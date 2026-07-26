# 🐸 Frog Mining — System Flow & User Journey

---

## Overview

Dokumen ini mendeskripsikan **seluruh alur pemain** dari pertama kali membuka game hingga setiap interaksi fitur. Semua pengembangan UI, API, dan database harus mengikuti alur ini.

### Core Principle

```
Pemain membuka game → Lihat Score → Tap Katak → Score naik → Paham cara bermain
                                    ↑                ↓
                                    └────────────────┘
                                    Kurang dari 5 detik
```

---

## 1. New Player Journey

### Flow Lengkap

```
1. Pemain membuka URL Frog Mining
          │
          ▼
2. Loading screen singkat (< 2 detik)
          │
          ▼
3. Welcome Screen
   ┌─────────────────────────┐
   │                         │
   │      🐸 FROG MINING     │
   │                         │
   │   ┌─────────────────┐   │
   │   │ Enter username  │   │  ← Input field
   │   └─────────────────┘   │
   │                         │
   │   [ 🎮 Mulai Bermain ]  │  ← Primary button
   │                         │
   └─────────────────────────┘
          │
          ▼ (pemain ketik username + tap Mulai)
4. Sistem membuat akun baru:
   - Generate Player ID (UUID)
   - Simpan Telegram ID (jika dari Telegram Mini App)
   - Simpan username
   - Set Score = 0
   - Set Diamond = 0
   - Set Joined At = now
   - Set Account Status = active
          │
          ▼
5. Redirect ke Home Screen
          │
          ▼
6. Home Screen muncul:
   ┌─────────────────────────┐
   │  💎 0    Score: 0       │
   │                         │
   │         0               │  ← Score = 0
   │        SCORE            │
   │                         │
   │        🐸               │  ← Frog.head idle animasi
   │      KEPALA             │    (bergerak-gerak kecil)
   │       KATAK             │
   │                         │
   │  🛒  🏆  📬  👤  ⚙️   │
   └─────────────────────────┘
          │
          ▼
7. Pemain melihat frog bergerak → penasaran → tap
          │
          ▼
8. Score = 1, floating "+1" muncul, frog bounce
          │
          ▼
9. ✅ Pemain paham cara bermain (< 5 detik)
```

### Rules for New Player

- **Tidak ada tutorial** — frog idle animation menarik perhatian
- **Tidak ada popup** — langsung ke gameplay
- **Tidak ada onboarding** — username + mulai = selesai
- **Score 0, Diamond 0** — semua pemain mulai sama
- **Auto Mining tidak aktif** — butuh Diamond untuk aktifkan

---

## 2. Core Gameplay Flow

### Tap Mining

```
Pemain tap frog head
          │
          ▼
┌─────────────────────────┐
│ 1. Score += 1           │  ← Instant
│ 2. Simpan ke server     │  ← Async, tidak block UI
│ 3. Frog bounce animasi  │  ← Visual feedback
│ 4. Floating "+1" muncul │  ← Reward feedback
│ 5. Sound "boing" diputar│  ← Audio feedback
│ 6. Score display update │  ← Realtime
└─────────────────────────┘
          │
          ▼
Pemain tap lagi → Ulangi
```

### Gameplay Rules

| Aturan | Detail |
|--------|--------|
| Score per tap | +1 (flat, tidak naik) |
| Batas tap | Tidak ada (unlimited) |
| Stamina/Energy | Tidak ada |
| Cooldown | Tidak ada |
| Simultaneous taps | Diabaikan (debounce 50ms) |
| Score cap | Tidak ada (unlimited) |
| Score transfer | Tidak bisa |
| Score purchase | Tidak bisa |

### Score Persistence

```
Tap → Score updated locally (instant)
    → Sent to server (async batch, setiap 2 detik atau 10 tap)
    → Server simpan ke database
    → Client dapat offline mode (simpan di localStorage, sync saat online)
```

---

## 3. Auto Mining Flow

### Activation Flow

```
Pemain buka Auto Mining panel
          │
          ▼
┌─────────────────────────┐
│  ⛏️ AUTO MINING         │
│                         │
│  Paket: Basic (60 detik)│
│  Biaya: 1 Diamond       │
│                         │
│  Saldo: 💎 5            │  ← Tampilkan saldo Diamond
│                         │
│  [ ⛏️ Aktifkan ]        │  ← Primary button
│                         │
└─────────────────────────┘
          │
          ▼ (pemain tap Aktifkan)
3. Sistem cek:
   - Diamond >= 1? ✓
   - Auto Mining sudah aktif? ✗ (belum)
          │
          ▼
4. Diamond -= 1
   (Saldo: 5 → 4)
          │
          ▼
5. Auto Mining timer dimulai:
   - Status: active
   - Start Time: now
   - End Time: now + 60 detik
          │
          ▼
6. Timer berjalan:
   ┌─────────────────────────────┐
   │  ⛏️ Auto Mining   45s left  │
   │  ████████████████░░░░░░░░░  │
   └─────────────────────────────┘
          │
          ▼ (setiap 1 detik)
7. Score += 1 (otomatis)
   Pemain TETAP bisa tap frog secara manual
          │
          ▼ (setelah 60 detik)
8. Auto Mining berhenti otomatis
   Timer hilang dari layar
   Pemain bisa beli lagi jika punya Diamond
```

### Auto Mining Rules

| Aturan | Detail |
|--------|--------|
| Biaya | 1 Diamond per aktivasi |
| Durasi | 60 detik |
| Score per detik | +1 |
| Stacking | Tidak bisa (aktifkan lagi = refresh durasi) |
| Pause | Tidak ada (jalan terus sampai habis) |
| Offline | Tetap jalan (server hitung saat reconnect) |
| Multiple instances | Tidak ada (1 active per player) |

---

## 4. Leaderboard Flow

### Realtime Update

```
Pemain tap frog
          │
          ▼
Score bertambah
          │
          ▼
Score dikirim ke server
          │
          ▼
Server update leaderboard entry:
- Periode daily: Score hari ini
- Periode weekly: Score minggu ini
- Periode monthly: Score bulan ini
          │
          ▼
Leaderboard ranking dihitung ulang
          │
          ▼
Peringkat pemain diperbarui di UI
```

### Period Cycle

```
         DAILY              WEEKLY             MONTHLY
    ┌───────────┐      ┌───────────┐      ┌───────────┐
    │ 00:00 UTC │      │ Senin     │      │ Tanggal 1 │
    │ to        │      │ 00:00 UTC │      │ 00:00 UTC │
    │ 23:59 UTC │      │ to        │      │ to        │
    │ (reset)   │      │ Minggu    │      │ Tgl terakhir│
    └───────────┘      │ 23:59 UTC │      │ 23:59 UTC │
                       │ (reset)   │      │ (reset)   │
                       └───────────┘      └───────────┘
```

### Leaderboard Display

```
┌─────────────────────────┐
│  🏆 LEADERBOARD         │
│                         │
│  ┌─ DAILY ─ WEEK ─ MON ┐│  ← Tab selector
│  └──────────────────────┘│
│                         │
│  #1  FrogMaster   12,450│  ← Top 3 ada crown/medal
│  #2  SwampKing    11,200│
│  #3  CrystalFrog  10,800│
│  ─────────────────────  │
│  #4  GreenToad     9,500│
│  #5  MineFrog      8,200│
│  ...                    │
│  ─────────────────────  │
│  #12 YOU (username) 5,000│  ← Highlight posisi pemain
│  ─────────────────────  │
│                         │
│  Next reset: 3h 24m     │  ← Countdown
└─────────────────────────┘
```

### Period Reset Flow

```
Periode berakhir (misal: daily 23:59 UTC)
          │
          ▼
1. Server hentikan perhitungan scoring
          │
          ▼
2. Tentukan peringkat akhir:
   - Ranking 1–10: Dapat Diamond reward
   - Ranking 11+: Tidak dapat reward
          │
          ▼
3. Hitung hadiah:
   - #1: 50 Diamond
   - #2: 30 Diamond
   - #3: 20 Diamond
   - #4–5: 10 Diamond
   - #6–10: 5 Diamond
          │
          ▼
4. Buat Mail untuk setiap pemenang:
   ┌─────────────────────────┐
   │ 📬 Daily Leaderboard    │
   │                         │
   │ Congratulations!        │
   │ You ranked #3!          │
   │                         │
   │ Reward: 💎 20 Diamond   │
   │                         │
   │ [ 🎁 Claim ]            │
   └─────────────────────────┘
          │
          ▼
5. Reset Score periode ke 0
   (Untuk daily: reset harian)
   (Untuk weekly: reset mingguan)
   (Untuk monthly: reset bulanan + reset TOTAL SCORE ke 0)
          │
          ▼
6. Mulai periode baru
```

---

## 5. Mail & Claim Flow

### Mail Inbox

```
Pemain tap 📬 Mail
          │
          ▼
┌─────────────────────────┐
│  📬 MAIL                │
│                         │
│  ┌───────────────────┐  │
│  │ 🎁 Daily Reward    │  │  ← Unclaimed (highlight)
│  │ 20 Diamond         │  │
│  │ 2 hours ago        │  │
│  └───────────────────┘  │
│                         │
│  ┌───────────────────┐  │
│  │ ✅ Weekly Bonus    │  │  ← Claimed (dim)
│  │ 50 Diamond         │  │
│  │ Claimed            │  │
│  └───────────────────┘  │
│                         │
│  ┌───────────────────┐  │
│  │ 🎁 Event Reward    │  │
│  │ 10 Diamond         │  │
│  │ 3 days left        │  │
│  └───────────────────┘  │
│                         │
└─────────────────────────┘
```

### Claim Flow

```
Pemain tap Mail (unclaimed)
          │
          ▼
┌─────────────────────────┐
│  📬 DAILY LEADERBOARD   │
│                         │
│  Congratulations!       │
│  You ranked #3 today!   │
│                         │
│  Your Reward:           │
│  💎 20 Diamond          │
│                         │
│  [ 🎁 Claim Reward ]    │  ← Primary button
│                         │
│  Expires in: 7 days     │  ← Jika ada expiry
└─────────────────────────┘
          │
          ▼ (pemain tap Claim)
3. Sistem proses:
   - Mail status: unclaimed → claimed
   - Diamond pemain += 20
   - Kirim event: diamond:change
          │
          ▼
4. UI update:
   - Saldo Diamond bertambah
   - Diamond sparkle animation
   - Mail item berubah jadi "Claimed"
   - Toast: "✅ +20 Diamond received!"
          │
          ▼
5. Mail tidak bisa diklaim lagi
```

### Mail Rules

| Aturan | Detail |
|--------|--------|
| Claim | Sekali saja, tidak bisa ulang |
| Expiry | Beberapa mail ada expiry (7 hari default) |
| Expired | Mail tetap ada tapi tidak bisa claim |
| Delete | Tidak ada (pemain bisa archive) |
| Max mail | Tidak ada batas |

---

## 6. Shop & Purchase Flow

### Shop Display

```
Pemain tap 🛒 Shop
          │
          ▼
┌─────────────────────────┐
│  🛒 SHOP                │
│                         │
│  Saldo: 💎 15           │
│                         │
│  ┌───────────────────┐  │
│  │ 💎 Starter Pack   │  │
│  │ 10 Diamond        │  │
│  │ Rp 5.000          │  │
│  │ [ Beli ]          │  │
│  └───────────────────┘  │
│                         │
│  ┌───────────────────┐  │
│  │ 💎 Basic Pack     │  │
│  │ 50 Diamond        │  │
│  │ Rp 20.000         │  │
│  │ [ Beli ]          │  │
│  └───────────────────┘  │
│                         │
│  ┌───────────────────┐  │
│  │ 💎 Mega Pack      │  │
│  │ 200 Diamond       │  │
│  │ Rp 50.000         │  │
│  │ [ Beli ]          │  │
│  └───────────────────┘  │
│                         │
│  ┌───────────────────┐  │
│  │ 💎 Ultimate Pack  │  │
│  │ 500 Diamond       │  │
│  │ Rp 100.000        │  │
│  │ [ Beli ]          │  │
│  └───────────────────┘  │
│                         │
└─────────────────────────┘
```

### Purchase Flow

```
Pemain tap [ Beli ] pada paket
          │
          ▼
1. Tampilkan konfirmasi:
   ┌─────────────────────────┐
   │  Beli Starter Pack?     │
   │                         │
   │  💎 10 Diamond          │
   │  Rp 5.000               │
   │                         │
   │  [ Batal ]  [ Bayar ]   │
   └─────────────────────────┘
          │
          ▼ (pemain tap Bayar)
2. Redirect ke payment gateway:
   - Pilih metode pembayaran
   - E-wallet / Credit Card / Bank Transfer / Carrier Billing
          │
          ▼
3. Pemain selesaikan pembayaran
          │
          ├───── BERHASIL ─────┐
          │                     │
          ▼                     ▼
4a. Payment verified     4b. Payment failed
    │                         │
    ▼                         ▼
5a. Buat Purchase History:  5b. Tampilkan error:
    - Transaction ID          - "Pembayaran gagal"
    - Player ID               - "Silakan coba lagi"
    - Product ID
    - Amount Paid
    - Payment Method
    - Status: completed
    - Completed At: now
          │
          ▼
6a. Diamond += paket amount
    (10 → 25)
          │
          ▼
7a. Kirim Mail konfirmasi:
    "Pembelian berhasil! +10 Diamond"
          │
          ▼
8a. Update UI:
    - Saldo Diamond bertambah
    - Diamond sparkle animation
    - Toast: "✅ +10 Diamond purchased!"
          │
          ▼
9a. Kembali ke Shop
```

### Cancel Flow

```
Pemain tap [ Batal ] pada konfirmasi
          │
          ▼
Kembali ke Shop
Tidak ada perubahan
Transaction status: (tidak dibuat)
```

---

## 7. Profile Flow

### Profile Display

```
Pemain tap 👤 Profile
          │
          ▼
┌─────────────────────────┐
│  👤 PROFILE             │
│                         │
│      🐸                 │  ← Avatar
│   FrogPlayer123         │  ← Username
│   Joined: Jan 2025      │
│                         │
│  ┌───────────────────┐  │
│  │ 📊 STATS          │  │
│  │ Total Score: 45,200│  │
│  │ Total Taps: 45,200│  │
│  │ Total Diamond: 25  │  │
│  │ Rank: #12 Daily   │  │
│  └───────────────────┘  │
│                         │
│  ┌───────────────────┐  │
│  │ 📜 HISTORY        │  │
│  │ Best Daily: #3    │  │
│  │ Best Weekly: #8   │  │
│  │ Best Monthly: #15 │  │
│  └───────────────────┘  │
│                         │
└─────────────────────────┘
```

---

## 8. Settings Flow

### Settings Display

```
Pemain tap ⚙️ Settings
          │
          ▼
┌─────────────────────────┐
│  ⚙️ SETTINGS            │
│                         │
│  Sound Effects    [ON]  │  ← Toggle
│  Music            [OFF] │  ← Toggle
│                         │
│  ───────────────────    │
│                         │
│  About                  │
│  Version: 0.1.0         │
│                         │
│  ───────────────────    │
│                         │
│  [ 🚪 Logout ]          │
│                         │
└─────────────────────────┘
```

---

## 9. Special Conditions

### 9.1 Player Closes Browser (Auto Mining Active)

```
Pemain tutup browser / tab
          │
          ▼
Auto Mining tetap berjalan di server
(Tidak berhenti hanya karena client close)
          │
          ▼
Saat pemain buka game lagi:
          │
          ▼
Sistem hitung:
- Waktu berlalu sejak terakhir aktif
- Jika masih dalam durasi Auto Mining:
  → Hitung Score yang dihasilkan selama offline
  → Tambahkan ke Score pemain
  → Update sisa waktu
- Jika sudah lewat durasi:
  → Auto Mining sudah berhenti
  → Tidak ada Score tambahan
          │
          ▼
Pemain melihat:
- Score sudah bertambah (termasuk offline mining)
- Auto Mining timer (sisa waktu jika masih aktif)
- Atau Auto Mining sudah tidak aktif
```

### 9.2 Player Returns After Hours

```
Pemain buka game setelah beberapa jam
          │
          ▼
Sistem proses:
1. Login/restore session
2. Cek Auto Mining status:
   - Jika masih aktif → hitung offline Score
   - Jika sudah habis → nothing
3. Cek Mail baru (leaderboard rewards)
4. Cek expired Mail
5. Restore Score & Diamond dari server
          │
          ▼
Pemain melihat:
- Score sudah update (termasuk offline gain)
- Mail baru jika ada reward
- Semua data sync dengan server
```

### 9.3 Multiple Unclaimed Mail

```
Pemain punya 5 Mail belum di-claim
          │
          ▼
Semua ditampilkan di inbox:
- Unclaimed = highlight (ada badge/underline)
- Bisa claim satu per satu
- Urutan: newest first
- Tidak ada "claim all" (keep simple)
          │
          ▼
Pemain claim satu per satu
Setiap claim:
- Diamond bertambah
- Mail status berubah
- Toast muncul
```

### 9.4 Insufficient Diamonds for Auto Mining

```
Pemain tap Aktifkan Auto Mining
Diamond: 0 (butuh 1)
          │
          ▼
Sistem cek: Diamond < cost
          │
          ▼
Tampilkan pesan:
┌─────────────────────────┐
│  💎 Not enough Diamond! │
│                         │
│  You need 1 Diamond     │
│  to activate Auto Mining│
│                         │
│  [ 🛒 Get Diamond ]     │  ← Link ke Shop
│  [ Close ]              │
└─────────────────────────┘
          │
          ▼
Pemain bisa:
- Buka Shop untuk beli Diamond
- Tutup popup, kembali ke game
```

### 9.5 Cancel Payment in Shop

```
Pemain di halaman payment gateway
          │
          ▼
Pemain tutup / back / cancel
          │
          ▼
Payment gateway return: cancelled
          │
          ▼
Sistem:
- Tidak buat Purchase History
- Tidak tambah Diamond
- Tampilkan pesan: "Pembayaran dibatalkan"
          │
          ▼
Kembali ke Shop
```

### 9.6 Network Loss During Play

```
Koneksi internet putus saat bermain
          │
          ▼
┌─────────────────────────┐
│ Client-side behavior:   │
│                         │
│ 1. Game tetap jalan     │
│ 2. Tap tetap bisa      │
│ 3. Score update lokal   │
│ 4. Tampilkan indicator: │
│    "📡 Reconnecting..." │
│ 5. Tap queue di local   │
└─────────────────────────┘
          │
          ▼ (koneksi pulih)
┌─────────────────────────┐
│ Sync behavior:          │
│                         │
│ 1. Kirim queued taps    │
│ 2. Sync Score ke server │
│ 3. Ambil data terbaru   │
│ 4. Update leaderboard   │
│ 5. Sembunyikan indicator│
│ 6. Toast: "✅ Synced!"  │
└─────────────────────────┘
          │
          ▼
Pemain lanjut bermain tanpa kehilangan progres
```

---

## 10. Monthly Reset Flow

### Full Reset Cycle

```
Bulan berakhir (tanggal terakhir, 23:59 UTC)
          │
          ▼
1. Leaderboard Bulanan ditutup
          │
          ▼
2. Hitung peringkat akhir bulanan
          │
          ▼
3. Distribusi hadiah:
   - #1: 100 Diamond
   - #2: 60 Diamond
   - #3: 40 Diamond
   - #4–5: 20 Diamond
   - #6–10: 10 Diamond
   - #11–50: 5 Diamond
          │
          ▼
4. Buat Mail untuk setiap pemenang
          │
          ▼
5. RESET SCORE KE 0:
   - Daily Score: reset
   - Weekly Score: reset
   - Monthly Score: reset
   - Total Score: RESET KE 0
          │
          ▼
6. Diamond TIDAK di-reset:
   - Semua Diamond tetap dimiliki
   - Bisa dipakai untuk Auto Mining
          │
          ▼
7. Musim baru dimulai
   - Pemain mulai dari Score 0
   - Leaderboard baru dimulai
   - Semua pemain bersaing dari awal
```

### Reset Rules

| Data | Di-reset? | Detail |
|------|-----------|--------|
| Score (daily) | ✅ Ya | Setiap hari |
| Score (weekly) | ✅ Ya | Setiap Senin |
| Score (monthly) | ✅ Ya | Setiap tanggal 1 |
| Total Score | ✅ Ya (monthly) | Reset setiap bulan |
| Diamond | ❌ Tidak | Tetap dimiliki |
| Auto Mining | ⚠️ Partial | Timer berhenti, tapi bisa aktifkan lagi |
| Mail | ❌ Tidak | Tetap ada (claim/expired) |
| Purchase History | ❌ Tidak | Tetap ada |
| Player Data | ❌ Tidak | Tetap ada |

---

## 11. Complete User Journey Map

```
┌─────────────────────────────────────────────────────────────┐
│                    FROG MINING USER JOURNEY                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────┐    ┌──────┐    ┌──────┐    ┌──────┐    ┌──────┐  │
│  │ OPEN │───▶│ TAP  │───▶│ SCORE│───▶│RANK UP│───▶│REWARD│  │
│  │ GAME │    │ FROG │    │ GOES │    │ ON    │    │DIAMOND│ │
│  └──────┘    └──────┘    │ UP   │    │ BOARD │    └───┬──┘  │
│                          └──────┘    └──────┘        │     │
│                                                       │     │
│  ┌──────────────────────────────────────────────────┐ │     │
│  │                                                  │ │     │
│  │  ┌──────┐    ┌──────┐    ┌──────┐    ┌──────┐   │ │     │
│  │  │SPEND │◀───│ BUY  │◀───│ OPEN │◀───│CLAIM │◀──┘     │
│  │  │DIAMOND│   │ IN   │    │ MAIL │    │ MAIL │         │
│  │  │      │    │ SHOP │    │      │    │      │         │
│  │  └──┬───┘    └──────┘    └──────┘    └──────┘         │
│  │     │                                                  │
│  │     ▼                                                  │
│  │  ┌──────────┐    ┌──────┐                              │
│  │  │ACTIVATE  │───▶│SCORE │  (loop back to SCORE GOES UP)│
│  │  │AUTO MINE │    │+1/SEC│                              │
│  │  └──────────┘    └──────┘                              │
│  │                                                        │
│  └────────────────────────────────────────────────────────┘
│                                                             │
│  CYCLE: Tap → Score ↑ → Rank ↑ → Reward → Diamond → Auto   │
│         Mining → Score ↑ (faster) → Rank ↑ (higher)        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 12. State Transitions Summary

### Player States

| State | Description | Transitions |
|-------|-------------|-------------|
| **New** | First time opening game | → Username input → Active |
| **Active** | Playing the game | → Inactive (close browser) |
| **Inactive** | Browser closed | → Active (reopen) |
| **Banned** | Account banned | → (none, manual intervention) |

### Auto Mining States

| State | Description | Transitions |
|-------|-------------|-------------|
| **Inactive** | Not mining | → Active (spend Diamond) |
| **Active** | Mining in progress | → Inactive (timer expires) |

### Mail States

| State | Description | Transitions |
|-------|-------------|-------------|
| **Unclaimed** | Has reward, not claimed | → Claimed (player claims) |
| **Claimed** | Reward claimed | → (terminal) |
| **Expired** | Past expiry date | → (terminal) |

### Purchase States

| State | Description | Transitions |
|-------|-------------|-------------|
| **Pending** | Payment initiated | → Completed / Failed |
| **Completed** | Payment successful | → (terminal) |
| **Failed** | Payment failed | → (terminal, retry) |
| **Refunded** | Payment refunded | → (terminal) |

---

## 13. Event Flow Map

```
Player Action          System Response              UI Update
─────────────          ──────────────              ─────────
Tap Frog         →     Score +1              →    Score display, +1 float
                                ↳ Server sync      Frog bounce
                                ↳ Leaderboard update

Open Shop        →     Load products         →    Product list
Buy Diamond      →     Payment gateway       →    Redirect, then Diamond++
Claim Mail       →     Diamond += reward     →    Diamond sparkle, Mail claimed
Activate Auto    →     Diamond -= 1, timer   →    Status bar, Score +1/sec
                                                              ↓
Period End       →     Rank calc, Mail send  →    Notification badge
Monthly Reset    →     Score = 0             →    Score display reset
```
