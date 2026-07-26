# 🐸 Frog Mining — Game Rules & Validation

> **Dokumen ini adalah aturan resmi Frog Mining.**
> Semua fitur yang dikembangkan harus mematuhi aturan ini, kecuali ada perubahan yang disetujui pengguna.

---

## 1. Score

### Aturan

| # | Aturan | Detail |
|---|--------|--------|
| S-01 | Score dimulai dari 0 | Semua pemain baru mulai dengan Score = 0 |
| S-02 | Score bertambah +1 per tap | Setiap kali pemain menekan kepala katak |
| S-03 | Auto Mining menambah +1 per detik | Selama Auto Mining aktif |
| S-04 | Score tidak memiliki batas maksimum | Pemain bisa mencapai Score berapa pun |
| S-05 | Score tidak dapat dibeli | Tidak ada cara membeli Score dengan Diamond atau uang |
| S-06 | Score tidak dapat dipindahkan | Tidak ada fitur transfer Score antar pemain |
| S-07 | Score tidak dapat ditukar Diamond | Score tidak bisa dikonversi ke Diamond |
| S-08 | Score tidak boleh negatif | Validasi: `score >= 0` selalu berlaku |

### Validasi

```
Setiap kali Score berubah:
  ASSERT newScore >= 0
  ASSERT newScore >= oldScore  (score hanya naik, tidak turun)

Kecuali:
  - Reset bulanan: score = 0
```

---

## 2. Diamond

### Aturan

| # | Aturan | Detail |
|---|--------|--------|
| D-01 | Diamond dimulai dari 0 | Semua pemain baru mulai dengan Diamond = 0 |
| D-02 | Diamond diperoleh dari Leaderboard | Hadiah saat periode berakhir |
| D-03 | Diamond diperoleh dari Shop | Pembelian dengan uang nyata |
| D-04 | Diamond digunakan untuk Auto Mining | Biaya activation |
| D-05 | Diamond untuk fitur premium masa depan | Ekspansi game |
| D-06 | Diamond tidak boleh negatif | Validasi: `diamond >= 0` selalu berlaku |

### Sumber Diamond

```
┌─────────────────────────────────────┐
│           SUMBER DIAMOND            │
├─────────────────────────────────────┤
│  ✅ Leaderboard Reward              │
│  ✅ Shop Purchase (uang nyata)      │
├─────────────────────────────────────┤
│  ❌ Score conversion                │
│  ❌ Transfer dari pemain lain       │
│  ❌ Bonus random / drop             │
│  ❌ Login daily reward              │
│  ❌ Quest / mission reward          │
└─────────────────────────────────────┘
```

### Validasi

```
Setiap kali Diamond berubah:
  ASSERT newDiamond >= 0

Diamond berubah hanya karena:
  1. add(amount, source)    → diamond += amount
  2. spend(amount, purpose) → diamond -= amount
```

---

## 3. Auto Mining

### Paket

| Paket | Biaya | Durasi | Total Score Dihasilkan |
|-------|-------|--------|----------------------|
| Basic | 💎 1.000 | 5 jam (18,000 detik) | 18,000 Score |
| Premium | 💎 5.000 | 24 jam (86,400 detik) | 86,400 Score |

### Aturan

| # | Aturan | Detail |
|---|--------|--------|
| AM-01 | Menghasilkan +1 Score per detik | Flat rate, tidak naik/turun |
| AM-02 | Tetap berjalan saat offline | Server menghitung saat pemain reconnect |
| AM-03 | Tap tetap bisa dilakukan | Auto Mining dan Tap berjalan bersamaan |
| AM-04 | Berhenti otomatis saat durasi habis | Tidak perlu manual stop |
| AM-05 | Tidak bisa ditumpuk | Satu sesi aktif per pemain |
| AM-06 | Tidak bisa beli paket baru saat aktif | Harus tunggu selesai atau habis |
| AM-07 | Tidak bisa pause | Berjalan terus sampai habis |
| AM-08 | Tidak bisa refund | Diamond tidak dikembalikan |

### Durasi Detail

```
BASIC PACK:
  Biaya:     💎 1.000
  Durasi:    5 jam
  Detik:     5 × 60 × 60 = 18,000 detik
  Score:     18,000 Score
  Efisiensi: 18,000 Score per 1,000 Diamond

PREMIUM PACK:
  Biaya:     💎 5.000
  Durasi:    24 jam
  Detik:     24 × 60 × 60 = 86,400 detik
  Score:     86,400 Score
  Efisiensi: 17.28 Score per Diamond
```

### Status Diagram

```
┌──────────────┐   beli paket    ┌──────────────┐
│   INACTIVE   │────────────────▶│    ACTIVE    │
│              │                 │              │
│  Tidak ada   │◀────────────────│  Timer       │
│  Auto Mining │   timer habis   │  berjalan    │
└──────────────┘                 └──────────────┘
       ▲                               │
       │         tidak bisa            │
       │◀──── beli paket baru ─────────┘
       │         saat aktif
       │                               │
       └───────────────────────────────┘
              hanya INACTIVE → ACTIVE
```

### Validasi

```
Saat pemain mencoba beli Auto Mining:
  ASSERT autoMining.status == INACTIVE
    ELSE return error: "already_active"

  ASSERT player.diamond >= paket.biaya
    ELSE return error: "insufficient_diamonds"

  Jika lolos:
    player.diamond -= paket.biaya
    autoMining.status = ACTIVE
    autoMining.package = paket
    autoMining.startTime = now
    autoMining.endTime = now + paket.durasi

Saat timer tick (setiap detik):
  ASSERT autoMining.status == ACTIVE
  ASSERT now < autoMining.endTime
    ELSE:
      autoMining.status = INACTIVE
      STOP

  player.score += 1
```

---

## 4. Leaderboard

### Jenis

| Periode | Durasi | Reset |
|---------|--------|-------|
| Harian | 1 hari | Setiap hari 00:00 UTC |
| Mingguan | 1 minggu | Setiap Senin 00:00 UTC |
| Bulanan | 1 bulan | Setiap tanggal 1 00:00 UTC |

### Aturan

| # | Aturan | Detail |
|---|--------|--------|
| LB-01 | Diurutkan berdasarkan Score tertinggi | Score periode, bukan total kumulatif |
| LB-02 | Tie-breaker: timestamp | Pemain yang mencapai Score lebih dulu = peringkat lebih tinggi |
| LB-03 | Minimal 1 Score untuk masuk leaderboard | Pemain dengan Score 0 tidak ditampilkan |
| LB-04 | Ranking dihitung ulang secara periodik | Realtime atau batch, tergantung implementasi |
| LB-05 | Periode Score berbeda dari Total Score | Periode Score = Score dalam periode itu saja |
| LB-06 | Total Score di-reset setiap bulan | Bersamaan dengan leaderboard bulanan |

### Periode Calculation

```
DAILY:
  Start:  00:00:00 UTC (hari ini)
  End:    23:59:59 UTC (hari yang sama)
  Reset:  00:00:00 UTC (hari berikutnya)

WEEKLY:
  Start:  Senin 00:00:00 UTC
  End:    Minggu 23:59:59 UTC
  Reset:  Senin 00:00:00 UTC

MONTHLY:
  Start:  Tanggal 1 00:00:00 UTC
  End:    Tanggal terakhir 23:59:59 UTC
  Reset:  Tanggal 1 00:00:00 UTC (bulan berikutnya)
```

### Ranking Algorithm

```
Untuk setiap periode:
  1. Ambil semua pemain dengan Score > 0 dalam periode
  2. Urutkan berdasarkan Score DESC
  3. Jika Score sama:
     - Pemain yang mencapai Score tersebut lebih dulu = peringkat lebih tinggi
     - Gunakan timestamp pertama kali mencapai Score tersebut
  4. Assign ranking: 1, 2, 3, ...
```

### Validasi

```
Setiap kali Score berubah:
  UPDATE leaderboard_entry
    WHERE player_id = playerId
    AND period = currentPeriod
  SET score = player.periodScore

  RECALCULATE ranking
    WHERE period = currentPeriod
```

---

## 5. Mail

### Aturan

| # | Aturan | Detail |
|---|--------|--------|
| M-01 | Mail dibuat oleh sistem | Bukan manual, otomatis dari event |
| M-02 | Hanya bisa di-Claim satu kali | Tidak bisa klaim berulang |
| M-03 | Setelah Claim, tidak bisa diklaim ulang | Status berubah ke "claimed" |
| M-04 | Masa berlaku bisa diatur admin | Default: tidak pernah expired |
| M-05 | Mail bisa berisi Diamond reward | Dari leaderboard atau event |
| M-06 | Mail bisa tanpa reward | Hanya info/pengumuman |

### Mail Status

```
┌──────────────┐   claim     ┌──────────────┐
│  UNCLAIMED   │────────────▶│   CLAIMED    │
│              │             │              │
│  Bisa claim  │             │  Selesai     │
└──────┬───────┘             └──────────────┘
       │
       │ expiry reached
       ▼
┌──────────────┐
│   EXPIRED    │
│              │
│  Tidak bisa  │
│  claim       │
└──────────────┘
```

### Validasi

```
Saat pemain mencoba claim mail:
  ASSERT mail.status == UNCLAIMED
    ELSE return error: "already_claimed"

  ASSERT mail.expiresAt == null OR mail.expiresAt > now
    ELSE return error: "mail_expired"

  Jika lolos:
    mail.status = CLAIMED
    player.diamond += mail.rewardAmount
```

---

## 6. Shop

### Aturan

| # | Aturan | Detail |
|---|--------|--------|
| SH-01 | Pembelian hanya berhasil jika pembayaran terverifikasi | Diamond tidak diberikan sebelum verifikasi |
| SH-02 | Diamond tidak diberikan sebelum pembayaran berhasil | Pre-payment = tidak ada Diamond |
| SH-03 | Semua transaksi harus tercatat | Purchase History wajib ada |
| SH-04 | Harga snapshot saat transaksi | Tidak berubah meski harga produk diupdate |
| SH-05 | Produk bisa diaktifkan/nonaktifkan admin | Status: active, inactive, sold_out |

### Purchase Flow

```
1. Pemain pilih produk
2. Konfirmasi: "Beli [Package] seharga [Harga]?"
3. Pemain tap "Bayar"
4. Redirect ke payment gateway
5. Pembayaran diproses
   │
   ├── BERHASIL ──▶ Buat Purchase History (status: completed)
   │                   │
   │                   ▼
   │                Diamond ditambahkan ke pemain
   │                   │
   │                   ▼
   │                Mail konfirmasi dikirim
   │                   │
   │                   ▼
   │                Toast: "Pembelian berhasil!"
   │
   ├── GAGAL ────▶ Buat Purchase History (status: failed)
   │                   │
   │                   ▼
   │                Toast: "Pembayaran gagal. Silakan coba lagi."
   │
   └── DIBATALKAN ▶ Tidak buat Purchase History
                      │
                      ▼
                   Toast: "Pembayaran dibatalkan."
```

### Validasi

```
Saat payment gateway konfirmasi berhasil:
  1. Buat Purchase History:
     - transactionId = generate UUID
     - playerId = current player
     - productId = purchased product
     - amountPaid = product.price (snapshot)
     - paymentMethod = method used
     - paymentStatus = COMPLETED
     - transactionDate = now
     - completedAt = now

  2. Tambah Diamond:
     ASSERT product.status == ACTIVE
     player.diamond += product.diamondAmount
     ASSERT player.diamond >= 0

  3. Kirim Mail:
     Create mail with reward
```

---

## 7. Reset Bulanan

### Aturan

| # | Aturan | Detail |
|---|--------|--------|
| R-01 | Leaderboard Bulanan ditutup | Tidak ada Score baru diterima untuk periode itu |
| R-02 | Hadiah dikirim ke Mail | Diamond reward via Mail |
| R-03 | Semua Score di-reset menjadi 0 | Daily, Weekly, Monthly, Total Score |
| R-04 | Diamond tetap dimiliki pemain | Tidak di-reset |
| R-05 | Musim baru dimulai | Semua pemain mulai dari 0 |

### Reset Sequence

```
WAKTU RESET (Tanggal 1, 00:00 UTC):

1. LOCK leaderboard bulanan
   → Tidak ada Score baru diterima

2. HITUNG peringkat akhir
   → Ranking 1–N berdasarkan Score

3. DISTRIBUSI hadiah:
   #1  → 💎 100 + Mail "Monthly #1 Champion!"
   #2  → 💎 60  + Mail "Monthly #2 Runner-up!"
   #3  → 💎 40  + Mail "Monthly #3 Bronze!"
   #4–5  → 💎 20 each + Mail
   #6–10 → 💎 10 each + Mail
   #11–50 → 💎 5 each + Mail

4. KIRIM semua Mail ke pemain yang berhak

5. RESET Score:
   - Daily Score → 0
   - Weekly Score → 0
   - Monthly Score → 0
   - Total Score → 0

6. BUKA leaderboard bulanan baru
   → Mulai dari Score 0

7. UNLOCK leaderboard
   → Pemain bisa mulai mengejar Score lagi
```

### Apa yang Di-reset

| Data | Di-reset? | Kapan |
|------|-----------|-------|
| Daily Score | ✅ | Setiap hari |
| Weekly Score | ✅ | Setiap Senin |
| Monthly Score | ✅ | Setiap tanggal 1 |
| Total Score | ✅ | Setiap tanggal 1 |
| Diamond | ❌ | Tidak pernah |
| Auto Mining | ⚠️ | Timer berhenti, tapi tidak dihapus |
| Mail | ❌ | Tetap ada |
| Purchase History | ❌ | Tetap ada |
| Player Data | ❌ | Tetap ada |

---

## 8. Validasi Sistem

### Validasi Wajib

Setiap operasi yang mengubah data harus melewati validasi berikut:

```
┌─────────────────────────────────────────────────────────┐
│                  VALIDATION RULES                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  SCORE                                                   │
│  ├── newScore >= 0                                       │
│  ├── Score hanya naik (kecuali reset bulanan)           │
│  └── Score tidak bisa dipindahkan                        │
│                                                         │
│  DIAMOND                                                 │
│  ├── newDiamond >= 0                                     │
│  ├── Hanya bertambah dari: leaderboard, shop            │
│  ├── Hanya berkurang dari: auto mining, future features │
│  └── Tidak bisa ditransfer                              │
│                                                         │
│  AUTO MINING                                             │
│  ├── Hanya 1 sesi aktif per pemain                      │
│  ├── Diamond cukup sebelum activate                      │
│  ├── Timer valid (endTime > startTime)                   │
│  └── Score per detik = 1 (flat)                         │
│                                                         │
│  MAIL                                                   │
│  ├── Claim hanya 1x                                     │
│  ├── Status valid (unclaimed/claimed/expired)           │
│  └── Expiry check sebelum claim                          │
│                                                         │
│  LEADERBOARD                                             │
│  ├── Score per periode konsisten                        │
│  ├── Ranking dihitung ulang saat Score berubah          │
│  └── Tie-breaker: timestamp konsisten                   │
│                                                         │
│  PURCHASE                                               │
│  ├── Diamond = 0 sebelum payment verified               │
│  ├── Snapshot harga saat transaksi                       │
│  └── Semua transaksi tercatat                            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Error Handling

| Error | Kode | Pesan |
|-------|------|-------|
| Score negatif | `ERR_SCORE_NEGATIVE` | "Score tidak boleh negatif" |
| Diamond negatif | `ERR_DIAMOND_NEGATIVE` | "Diamond tidak boleh negatif" |
| Diamond tidak cukup | `ERR_INSUFFICIENT_DIAMONDS` | "Diamond tidak cukup" |
| Auto Mining aktif | `ERR_AUTO_MINING_ACTIVE` | "Auto Mining sudah aktif" |
| Mail sudah claim | `ERR_MAIL_CLAIMED` | "Mail sudah diklaim" |
| Mail expired | `ERR_MAIL_EXPIRED` | "Mail sudah kedaluwarsa" |
| Produk tidak aktif | `ERR_PRODUCT_INACTIVE` | "Produk tidak tersedia" |
| Pembayaran gagal | `ERR_PAYMENT_FAILED` | "Pembayaran gagal" |
| Session invalid | `ERR_SESSION_INVALID` | "Sesi tidak valid" |

---

## 9. Keamanan Dasar

### Prinsip

```
┌─────────────────────────────────────────────────┐
│              CLIENT = DISPLAY ONLY               │
│              SERVER = SOURCE OF TRUTH            │
├─────────────────────────────────────────────────┤
│                                                 │
│  Client (Browser/Mini App):                     │
│  ├── Menampilkan data dari server               │
│  ├── Mengirim permintaan (tap, buy, claim)      │
│  ├── Menyimpan cache sementara                  │
│  └── TIDAK menentukan hasil akhir              │
│                                                 │
│  Server (Backend):                              │
│  ├── Memproses semua perubahan Score            │
│  ├── Memproses semua perubahan Diamond          │
│  ├── Menghitung leaderboard                     │
│  ├── Menghitung hadiah                          │
│  ├── Memverifikasi pembayaran                   │
│  └── Menjadi source of truth                    │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Server-Side Rules

| Operasi | Diproses oleh | Validasi |
|---------|---------------|----------|
| Tap (Score +1) | Server | Rate limit, anti-cheat |
| Auto Mining tick | Server | Timer valid, status active |
| Diamond spend | Server | Balance cukup, purpose valid |
| Diamond add | Server | Source valid (leaderboard/shop) |
| Mail claim | Server | Status unclaimed, expiry valid |
| Purchase | Server | Payment verified by gateway |
| Leaderboard calc | Server | Period valid, tie-breaker konsisten |
| Monthly reset | Server | Waktu tepat, sekali saja |

### Client Responsibilities

```
Client BOLEH:
  ✅ Menampilkan Score dari server
  ✅ Menampilkan Diamond dari server
  ✅ Mengirim event "tap" ke server
  ✅ Mengirim permintaan "buy" ke server
  ✅ Mengirim permintaan "claim" ke server
  ✅ Menyimpan cache lokal untuk offline mode
  ✅ Menampilkan animasi dan efek visual

Client TIDAK BOLEH:
  ❌ Menentukan Score akhir
  ❌ Menentukan Diamond akhir
  ❌ Menentukan peringkat leaderboard
  ❌ Menentukan hadiah mail
  ❌ Memverifikasi pembayaran sendiri
  ❌ Mengubah data server secara langsung
```

---

## 10. Rule Reference Table

### Quick Reference

| ID | Rule | Category |
|----|------|----------|
| S-01 | Score mulai dari 0 | Score |
| S-02 | Score +1 per tap | Score |
| S-03 | Auto Mining +1 per detik | Score |
| S-04 | Score tanpa batas | Score |
| S-05 | Score tidak bisa dibeli | Score |
| S-06 | Score tidak bisa dipindah | Score |
| S-07 | Score tidak bisa ditukar Diamond | Score |
| S-08 | Score tidak negatif | Score |
| D-01 | Diamond mulai dari 0 | Diamond |
| D-02 | Diamond dari leaderboard | Diamond |
| D-03 | Diamond dari shop | Diamond |
| D-04 | Diamond untuk auto mining | Diamond |
| D-05 | Diamond untuk fitur premium | Diamond |
| D-06 | Diamond tidak negatif | Diamond |
| AM-01 | Auto Mining +1/detik | Auto Mining |
| AM-02 | Auto Mining jalan saat offline | Auto Mining |
| AM-03 | Tap tetap bisa saat aktif | Auto Mining |
| AM-04 | Berhenti otomatis | Auto Mining |
| AM-05 | Tidak bisa ditumpuk | Auto Mining |
| AM-06 | Tidak bisa beli baru saat aktif | Auto Mining |
| AM-07 | Tidak bisa pause | Auto Mining |
| AM-08 | Tidak bisa refund | Auto Mining |
| LB-01 | Urutkan Score tertinggi | Leaderboard |
| LB-02 | Tie-breaker: timestamp | Leaderboard |
| LB-03 | Minimal 1 Score untuk masuk | Leaderboard |
| LB-04 | Ranking dihitung ulang periodik | Leaderboard |
| LB-05 | Periode Score ≠ Total Score | Leaderboard |
| LB-06 | Total Score reset bulanan | Leaderboard |
| M-01 | Mail dibuat sistem | Mail |
| M-02 | Claim 1x saja | Mail |
| M-03 | Tidak bisa claim ulang | Mail |
| M-04 | Expiry bisa diatur admin | Mail |
| M-05 | Mail bisa berisi Diamond | Mail |
| M-06 | Mail bisa tanpa reward | Mail |
| SH-01 | Pembayaran harus terverifikasi | Shop |
| SH-02 | Diamond = 0 sebelum verifikasi | Shop |
| SH-03 | Semua transaksi tercatat | Shop |
| SH-04 | Harga snapshot saat transaksi | Shop |
| SH-05 | Produk bisa aktif/nonaktif | Shop |
| R-01 | Leaderboard ditutup | Reset |
| R-02 | Hadiah via Mail | Reset |
| R-03 | Score = 0 | Reset |
| R-04 | Diamond tetap | Reset |
| R-05 | Musim baru mulai | Reset |

---

## 11. Document Authority

### Hierarchy

```
1. GAME_RULES.md (Dokumen ini)
   └── Aturan resmi, tidak boleh dilanggar

2. SYSTEM_FLOW.md
   └── Alur harus konsisten dengan aturan

3. DATA_MODEL.md
   └── Struktur data harus mendukung aturan

4. UIUX_DESIGN.md
   └── Tampilan harus mencerminkan aturan

5. TECH_STACK.md
   └── Teknologi harus mendukung aturan
```

### Change Policy

```
Perubahan aturan hanya bisa dilakukan jika:
  1. Pengguna secara eksplisit meminta perubahan
  2. Perubahan didokumentasikan di dokumen ini
  3. Seluruh sistem diperbarui untuk mengikuti perubahan

Perubahan tidak boleh:
  1. Melanggar aturan yang sudah ada tanpa persetujuan
  2. Menambahkan fitur yang tidak diminta
  3. Mengubah validasi yang sudah ada
```
