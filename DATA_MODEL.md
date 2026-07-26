# 🐸 Frog Mining — Data Model & Entity Design

---

## Overview

Frog Mining memiliki **2 mata uang**: Score (gameplay) dan Diamond (premium).
Semua data dirancang agar sederhana, mudah di-query untuk leaderboard, dan siap diintegrasikan dengan Telegram Mini App.

---

## Entity 1 — Player

Data identitas dan status setiap pemain.

| Field | Tipe | Keterangan |
|-------|------|------------|
| **Player ID** | String (UUID) | ID unik pemain. Primary key. Tidak bisa diubah. |
| **Telegram ID** | BigInt (unique) | ID Telegram pemain. Digunakan untuk autentikasi Telegram Mini App. |
| **Username** | String | Nama tampilan pemain. Bisa diubah oleh pemain. |
| **Profile Photo** | String (URL/nullable) | URL foto profil dari Telegram. Opsional. |
| **Total Score** | BigInt | Akumulasi seluruh Score yang pernah diperoleh. Tidak pernah direset. Dasar perhitungan leaderboard. |
| **Total Diamond** | Integer | Jumlah Diamond yang dimiliki saat ini. Bertambah dari hadiah/shop, berkurang saat belanja. |
| **Joined At** | Timestamp | Waktu pertama kali pemain bergabung. Tidak berubah. |
| **Last Login At** | Timestamp | Waktu terakhir pemain login. Diupdate setiap sesi baru. |
| **Account Status** | Enum | Status akun: `active`, `banned`, `deactivated`. Default: `active`. |

### Fungsi Setiap Field

- **Player ID** → Referensi unik di seluruh sistem. Dipakai di semua relasi.
- **Telegram ID** → SSO login via Telegram Mini App, tidak perlu password.
- **Username** → Identitas visual di leaderboard dan mail.
- **Profile Photo** → Personalisasi tampilan.
- **Total Score** → Ranking leaderboard (harian/mingguan/bulanan).
- **Total Diamond** → Saldo premium yang bisa dibelanjakan.
- **Joined At** → Statistik, milestone, dan analisis.
- **Last Login At** → Deteksi pemain aktif vs tidak aktif.
- **Account Status** → Moderasi: ban akun cheater, atau self-deactivate.

---

## Entity 2 — Auto Mining

Status Auto Mining aktif milik pemain.

| Field | Tipe | Keterangan |
|-------|------|------------|
| **Player ID** | String (FK) | Pemilik sesi Auto Mining ini. Relasi ke Player. |
| **Status** | Enum | `active` atau `inactive`. |
| **Package Name** | String | Jenis paket yang aktif (contoh: `basic_60s`, `premium_300s`). Memudahkan penambahan paket baru. |
| **Start Time** | Timestamp | Waktu Auto Mining diaktifkan. |
| **End Time** | Timestamp | Waktu Auto Mining berakhir (Start Time + Duration). |
| **Score Generated** | BigInt | Total Score yang dihasilkan selama sesi ini. Berguna untuk statistik dan debugging. |

### Fungsi Setiap Field

- **Player ID** → Hanya satu sesi Auto Mining aktif per pemain.
- **Status** → Cek cepat apakah pemain sedang mining.
- **Package Name** → Fleksibilitas: paket berbeda = durasi/kecepatan berbeda (ekspansi masa depan).
- **Start Time / End Time** → Hitung sisa durasi, validasi apakah masih aktif.
- **Score Generated** → Audit trail: berapa score yang dihasilkan dari Auto Mining.

### Aturan

- Satu pemain hanya boleh punya **satu** sesi Auto Mining aktif.
- Jika sudah aktif, mengaktifkan lagi **memperpanjang durasi** (tidak menambah sesi baru).
- Auto Mining berhenti otomatis saat End Time tercapai.

---

## Entity 3 — Mail

Sistem pesan/mail untuk mengirim hadiah ke pemain.

| Field | Tipe | Keterangan |
|-------|------|------------|
| **Mail ID** | String (UUID) | ID unik pesan. Primary key. |
| **Player ID** | String (FK) | Penerima pesan. Relasi ke Player. |
| **Title** | String | Judul pesan (contoh: "Leaderboard Reward!"). |
| **Content** | Text | Isi pesan. Bisa berisi deskripsi hadiah atau pengumuman. |
| **Reward Type** | Enum | Jenis hadiah: `diamond`, `none`. |
| **Reward Amount** | Integer | Jumlah Diamond yang bisa di-claim. 0 jika tidak ada hadiah. |
| **Claim Status** | Enum | `unclaimed`, `claimed`, `expired`. Default: `unclaimed`. |
| **Sent At** | Timestamp | Waktu pesan dikirim. |
| **Expires At** | Timestamp (nullable) | Waktu pesan kadaluarsa. `null` = tidak pernah kadaluarsa. |

### Fungsi Setiap Field

- **Mail ID** → Referensi unik untuk claim dan log.
- **Player ID** → Mail selalu ditujukan ke satu pemain.
- **Title / Content** → Komunikasi ke pemain: reward notification, event info, dsb.
- **Reward Type** → Menentukan apa yang diberikan saat claim.
- **Reward Amount** → Jumlah Diamond yang masuk ke saldo pemain.
- **Claim Status** → Mencegah double-claim, tracking apakah sudah diambil.
- **Sent At** → Urutan tampilan di inbox.
- **Expires At** → Batas waktu klaim (contoh: hadiah event berakhir dalam 7 hari).

### Alur Mail

```
System/Dashboard ──kirim──▶ Mail (unclaimed) ──claim──▶ Player.Diamonds + RewardAmount ──▶ Mail (claimed)
                                                                              │
                                                              ──timeout──▶ Mail (expired)
```

---

## Entity 4 — Leaderboard

Peringkat pemain berdasarkan Score. Dikelompokkan per periode.

| Field | Tipe | Keterangan |
|-------|------|------------|
| **Player ID** | String (FK) | Pemain yang masuk leaderboard. Relasi ke Player. |
| **Username** | String | Snapshot nama saat periode berjalan (tidak berubah jika username diubah). |
| **Score** | BigInt | Score yang diperoleh dalam periode ini (bukan total kumulatif). |
| **Ranking** | Integer | Posisi peringkat (1 = teratas). Dihitung ulang saat periode baru. |
| **Period** | Enum | `daily`, `weekly`, `monthly`. |
| **Period Start** | Timestamp | Awal periode (contoh: Senin 00:00 untuk weekly). |
| **Period End** | Timestamp | Akhir periode. |
| **Calculated At** | Timestamp | Waktu terakhir ranking dihitung/diperbarui. |

### Fungsi Setiap Field

- **Player ID** → Hubungan ke pemain. Satu pemain punya entry per periode.
- **Username** → Snapshot agar leaderboard tetap konsisten meski username berubah.
- **Score** → Basis perhitungan ranking. Di-reset di awal setiap periode.
- **Ranking** → Posisi pemain. Dihitung menggunakan window function (ROW_NUMBER).
- **Period** → Memisahkan leaderboard per jenis.
- **Period Start / End** → Menentukan data periode mana yang aktif.
- **Calculated At** → Kapan terakhir ranking dihitung (untuk cache/refresh logic).

### Periode Calculation

| Period | Start | End | Reset |
|--------|-------|-----|-------|
| Daily | 00:00 UTC | 23:59 UTC (hari yang sama) | Setiap hari |
| Weekly | Senin 00:00 UTC | Minggu 23:59 UTC | Setiap Senin |
| Monthly | Tanggal 1 00:00 UTC | Tanggal terakhir 23:59 UTC | Setiap tanggal 1 |

### Aturan

- Score di leaderboard = Score yang diperoleh **dalam periode tersebut** (bukan total).
- Ranking dihitung ulang secara periodik (realtime atau batch).
- Pemain harus punya minimal 1 score agar masuk leaderboard.
- Jika score sama, pemain yang lebih dulu mencapai score tersebut menang (tie-breaker: timestamp).

---

## Entity 5 — Shop

Produk Diamond yang bisa dibeli pemain.

| Field | Tipe | Keterangan |
|-------|------|------------|
| **Product ID** | String (UUID) | ID unik produk. Primary key. |
| **Package Name** | String | Nama tampilan paket (contoh: "Starter Pack", "Mega Pack"). |
| **Diamond Amount** | Integer | Jumlah Diamond yang diterima pemain. |
| **Price** | Decimal | Harga dalam mata uang lokal (IDR/USD). |
| **Currency** | String | Kode mata uang (contoh: `IDR`, `USD`). |
| **Status** | Enum | `active`, `inactive`, `sold_out`. Default: `active`. |

### Fungsi Setiap Field

- **Product ID** → Referensi unik untuk transaksi dan API payment.
- **Package Name** → Tampilan di shop UI.
- **Diamond Amount** → Jelas berapa yang didapat.
- **Price / Currency** → Harga yang dibayar.
- **Status** → Kontrol visibility: sembunyikan produk yang tidak dijual, atau tandai sold out.

### Contoh Produk

| Package Name | Diamond Amount | Price | Status |
|-------------|---------------|-------|--------|
| Starter Pack | 10 | 5.000 IDR | active |
| Basic Pack | 50 | 20.000 IDR | active |
| Mega Pack | 200 | 50.000 IDR | active |
| Ultimate Pack | 500 | 100.000 IDR | active |

---

## Entity 6 — Purchase History

Log setiap transaksi pembelian Diamond.

| Field | Tipe | Keterangan |
|-------|------|------------|
| **Transaction ID** | String (UUID) | ID unik transaksi. Primary key. |
| **Player ID** | String (FK) | Pembeli. Relasi ke Player. |
| **Product ID** | String (FK) | Produk yang dibeli. Relasi ke Shop. |
| **Amount Paid** | Decimal | Nominal yang dibayar (snapshot harga saat transaksi). |
| **Payment Method** | Enum | `credit_card`, `e_wallet`, `bank_transfer`, `carrier_billing`, `telegram_stars`. |
| **Payment Status** | Enum | `pending`, `completed`, `failed`, `refunded`. |
| **Transaction Date** | Timestamp | Waktu transaksi dibuat. |
| **Completed At** | Timestamp (nullable) | Waktu pembayaran berhasil. `null` jika belum selesai. |

### Fungsi Setiap Field

- **Transaction ID** → Referensi unik untuk tracking, refund, dan support.
- **Player ID** → Siapa yang melakukan pembelian.
- **Product ID** → Apa yang dibeli (snapshot: jika harga berubah, transaksi lama tetap benar).
- **Amount Paid** → Snapshot harga saat belanja (tidak berubah meski harga produk diupdate).
- **Payment Method** → Tracking channel pembayaran, analisis preferensi pemain.
- **Payment Status** → Alur transaksi: pending → completed / failed / refunded.
- **Transaction Date / Completed At** → Audit trail dan reconciliasi pembayaran.

### Alur Transaksi

```
Player beli ──▶ Transaction (pending) ──bayar──▶ Payment Gateway
                                                        │
                                          ┌─────────────┼─────────────┐
                                          ▼             ▼             ▼
                                    Transaction   Transaction   Transaction
                                    (completed)   (failed)      (refunded)
                                          │
                                    Diamond masuk ke Player
                                    Mail reward dikirim
```

---

## Entity Relationships

```
Player
  │
  ├── 1 ──── Auto Mining      (satu pemain = satu sesi aktif)
  │
  ├── 1 ──── Leaderboard      (satu pemain = satu entry per periode)
  │
  ├── 1 ──── Mail             (satu pemain = banyak mail)
  │
  ├── 1 ──── Purchase History (satu pemain = banyak transaksi)
  │
  └── * ──── * Shop           (pemain beli banyak produk, produk dibeli banyak pemain)
                                  │
                                  └── 1 ── Purchase History (satu transaksi = satu produk)
```

### Penjelasan Hubungan

| Relationship | Cardinality | Penjelasan |
|-------------|-------------|------------|
| **Player → Auto Mining** | 1 : 0..1 | Satu pemain punya maksimal satu sesi Auto Mining aktif. Jika tidak aktif, 0 sesi. |
| **Player → Leaderboard** | 1 : N | Satu pemain punya banyak entry leaderboard (satu per periode: daily, weekly, monthly). |
| **Player → Mail** | 1 : N | Satu pemain bisa menerima banyak mail (reward, pengumuman, dll). |
| **Player → Purchase History** | 1 : N | Satu pemain bisa melakukan banyak transaksi pembelian. |
| **Player ↔ Shop** | N : M | Relasi many-to-many melalui Purchase History. Pemain beli banyak produk, produk dibeli banyak pemain. |
| **Purchase History → Shop** | N : 1 | Satu transaksi merujuk ke satu produk (produk apa yang dibeli). |

---

## Data Flow Summary

```
┌──────────┐    tap     ┌───────────────┐
│  Player  │───────────▶│ Score (+1)    │──── leaderboard ranking
└────┬─────┘            └───────────────┘
     │
     │ beli Diamond
     ▼
┌──────────┐  Diamond  ┌───────────────┐
│   Shop   │──────────▶│ Auto Mining   │──── score per detik
└────┬─────┘            └───────────────┘
     │
     │ transaksi
     ▼
┌──────────────────┐
│ Purchase History │
└──────────────────┘

┌──────────┐  reward   ┌──────────┐
│ Leaderboard│────────▶│   Mail   │──── claim Diamond
└──────────┘          └──────────┘
```

### Satu Siklus Permainan

1. **Player** taps frog → **Score** bertambah
2. **Score** menentukan posisi di **Leaderboard**
3. **Leaderboard** reward → **Mail** terkirim ke **Player**
4. **Player** claim mail → **Diamond** bertambah
5. **Player** beli di **Shop** → **Purchase History** tercatat, **Diamond** bertambah
6. **Player** gunakan Diamond → **Auto Mining** aktif → **Score** bertambah otomatis
7. Ulangi siklus

---

## Notes

- Semua ID menggunakan UUID v4 agar unik dan tidak bisa di-predict.
- Timestamp selalu dalam UTC untuk konsistensi timezone.
- Score di leaderboard adalah **score per periode**, bukan total kumulatif.
- Purchase History menyimpan **snapshot harga** agar data tetap benar meski harga produk berubah.
- Auto Mining memiliki **package name** untuk fleksibilitas penambahan paket baru di masa depan.
- Mail memiliki **expiry** untuk mencegah penumpukan hadiah yang tidak di-claim.
