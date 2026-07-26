# 🐸 Frog Mining — Database Schema Design

> **Database menjadi penyimpanan utama seluruh data game.**
> Seluruh perubahan data dilakukan melalui Backend. Frontend tidak boleh mengakses database secara langsung.

---

## 1. Overview

### Database Principles

```
┌─────────────────────────────────────────────────────────┐
│              DATABASE PRINCIPLES                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. Backend Only                                        │
│     └── Semua akses database melalui Backend            │
│                                                         │
│  2. UUID Primary Key                                    │
│     └── Semua tabel menggunakan UUID v4                  │
│                                                         │
│  3. Normalized                                          │
│     └── Hindari data duplikat                            │
│                                                         │
│  4. Indexed                                             │
│     └── Query cepat untuk leaderboard & search           │
│                                                         │
│  5. Auditable                                           │
│     └── Semua perubahan ada timestamp                    │
│                                                         │
│  6. Configurable                                        │
│     └── Konfigurasi game tanpa ubah kode                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Table Overview

| Table | Fungsi | Records (estimasi) |
|-------|--------|-------------------|
| **players** | Data pemain | 10,000–1,000,000 |
| **auto_mining** | Sesi Auto Mining | 1,000–10,000 aktif |
| **leaderboard_seasons** | Musim leaderboard | 90 (3 bulan × 30 hari) |
| **leaderboards** | Entry leaderboard | 100,000–1,000,000 |
| **mails** | Mail ke pemain | 100,000–1,000,000 |
| **shop_products** | Produk Diamond | 5–10 |
| **purchases** | Record pembelian | 10,000–100,000 |
| **payments** | Record pembayaran | 10,000–100,000 |
| **transactions** | Log perubahan Diamond | 100,000–1,000,000 |
| **system_settings** | Konfigurasi game | 20–50 |
| **admin_logs** | Log aktivitas admin | 10,000–100,000 |

---

## 2. Table: players

### Purpose

Menyimpan data identitas dan status setiap pemain. Tabel utama yang direferensikan oleh hampir semua tabel lain.

### Schema

```
┌─────────────────────────────────────────────────────────┐
│                      TABLE: players                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  id                    UUID (PK)                        │
│  telegram_id           BIGINT (UNIQUE, nullable)        │
│  username              VARCHAR(50)                      │
│  avatar_url            VARCHAR(500) (nullable)          │
│  total_score           BIGINT DEFAULT 0                 │
│  total_diamond         INTEGER DEFAULT 0                │
│  created_at            TIMESTAMP DEFAULT NOW            │
│  updated_at            TIMESTAMP DEFAULT NOW            │
│  last_login_at         TIMESTAMP (nullable)             │
│  account_status        ENUM('active','banned',          │
│                             'deactivated')              │
│                         DEFAULT 'active'                │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Column Descriptions

| Column | Tipe | Nullable | Default | Fungsi |
|--------|------|----------|---------|--------|
| `id` | UUID | No | auto | ID unik pemain, primary key |
| `telegram_id` | BigInt | Yes | null | ID Telegram untuk SSO. Unique, nullable (non-Telegram players) |
| `username` | VARCHAR(50) | No | — | Nama tampilan pemain |
| `avatar_url` | VARCHAR(500) | Yes | null | URL foto profil dari Telegram |
| `total_score` | BigInt | No | 0 | Akumulasi seluruh Score. Dasar leaderboard |
| `total_diamond` | Integer | No | 0 | Saldo Diamond saat ini |
| `created_at` | Timestamp | No | NOW() | Waktu pertama kali bergabung |
| `updated_at` | Timestamp | No | NOW() | Waktu terakhir update data |
| `last_login_at` | Timestamp | Yes | null | Waktu terakhir login |
| `account_status` | Enum | No | 'active' | Status: active, banned, deactivated |

### Indexes

| Index | Columns | Purpose |
|-------|---------|---------|
| PRIMARY | `id` | Unique identifier |
| UNIQUE | `telegram_id` | Cegah duplikat Telegram |
| INDEX | `username` | Search by username |
| INDEX | `total_score` | Leaderboard ranking |
| INDEX | `account_status` | Filter active players |

---

## 3. Table: auto_mining

### Purpose

Menyimpan informasi sesi Auto Mining yang sedang aktif atau baru saja selesai. Satu pemain hanya boleh punya satu sesi aktif.

### Schema

```
┌─────────────────────────────────────────────────────────┐
│                   TABLE: auto_mining                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  id                    UUID (PK)                        │
│  player_id             UUID (FK → players.id)           │
│  status                ENUM('active','inactive')        │
│                         DEFAULT 'active'                │
│  package_name          VARCHAR(50)                      │
│  diamond_cost          INTEGER                          │
│  start_time            TIMESTAMP                        │
│  end_time              TIMESTAMP                        │
│  last_processed_time   TIMESTAMP                        │
│  total_generated_score BIGINT DEFAULT 0                 │
│  created_at            TIMESTAMP DEFAULT NOW            │
│  updated_at            TIMESTAMP DEFAULT NOW            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Column Descriptions

| Column | Tipe | Nullable | Default | Fungsi |
|--------|------|----------|---------|--------|
| `id` | UUID | No | auto | ID unik sesi Auto Mining |
| `player_id` | UUID | No | — | Pemilik sesi. FK → players |
| `status` | Enum | No | 'active' | Status: active atau inactive |
| `package_name` | VARCHAR(50) | No | — | Nama paket: 'basic_5h', 'premium_24h' |
| `diamond_cost` | Integer | No | — | Diamond yang dibayar (snapshot) |
| `start_time` | Timestamp | No | — | Waktu Auto Mining diaktifkan |
| `end_time` | Timestamp | No | — | Waktu Auto Mining berakhir |
| `last_processed_time` | Timestamp | No | — | Waktu terakhir score dihitung (untuk offline) |
| `total_generated_score` | BigInt | No | 0 | Total Score yang dihasilkan sesi ini |
| `created_at` | Timestamp | No | NOW() | Waktu record dibuat |
| `updated_at` | Timestamp | No | NOW() | Waktu terakhir update |

### Indexes

| Index | Columns | Purpose |
|-------|---------|---------|
| PRIMARY | `id` | Unique identifier |
| INDEX | `player_id` | Cari sesi per pemain |
| INDEX | `status` | Filter sesi aktif |
| UNIQUE ACTIVE | `player_id` WHERE status='active' | Satu sesi aktif per player |

### Business Rules

- Satu pemain hanya boleh punya **satu** sesi `status='active'`
- `end_time` harus selalu > `start_time`
- `last_processed_time` diupdate setiap kali score dihitung
- `total_generated_score` bertambah setiap detik

---

## 4. Table: leaderboard_seasons

### Purpose

Menyimpan informasi musim/periode leaderboard. Setiap periode (daily/weekly/monthly) punya record sendiri.

### Schema

```
┌─────────────────────────────────────────────────────────┐
│               TABLE: leaderboard_seasons                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  id                    UUID (PK)                        │
│  type                  ENUM('daily','weekly','monthly')  │
│  start_time            TIMESTAMP                        │
│  end_time              TIMESTAMP                        │
│  reward_diamond_pool   INTEGER DEFAULT 0                │
│  status                ENUM('active','closed')          │
│                         DEFAULT 'active'                │
│  created_at            TIMESTAMP DEFAULT NOW            │
│  closed_at             TIMESTAMP (nullable)             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Column Descriptions

| Column | Tipe | Nullable | Default | Fungsi |
|--------|------|----------|---------|--------|
| `id` | UUID | No | auto | ID unik musim |
| `type` | Enum | No | — | daily, weekly, monthly |
| `start_time` | Timestamp | No | — | Waktu periode dimulai |
| `end_time` | Timestamp | No | — | Waktu periode berakhir |
| `reward_diamond_pool` | Integer | No | 0 | Total Diamond untuk hadiah periode ini |
| `status` | Enum | No | 'active' | Status: active atau closed |
| `created_at` | Timestamp | No | NOW() | Waktu record dibuat |
| `closed_at` | Timestamp | Yes | null | Waktu periode ditutup |

### Indexes

| Index | Columns | Purpose |
|-------|---------|---------|
| PRIMARY | `id` | Unique identifier |
| INDEX | `type` | Filter by period type |
| INDEX | `status` | Filter active seasons |
| INDEX | `start_time, end_time` | Cari season berdasarkan waktu |

### Season Lifecycle

```
Created → Active → Closed
  │         │        │
  │         │        └── Distribute rewards, create mails
  │         └── Players compete
  └── New season created
```

---

## 5. Table: leaderboards

### Purpose

Menyimpan entry leaderboard untuk setiap pemain di setiap musim. Score pemain dalam periode tertentu.

### Schema

```
┌─────────────────────────────────────────────────────────┐
│                   TABLE: leaderboards                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  id                    UUID (PK)                        │
│  season_id             UUID (FK → leaderboard_seasons)  │
│  player_id             UUID (FK → players.id)           │
│  score                 BIGINT DEFAULT 0                 │
│  rank                  INTEGER (nullable)               │
│  reward_diamond        INTEGER DEFAULT 0                │
│  reward_status         ENUM('pending','claimed',        │
│                             'expired')                  │
│                         DEFAULT 'pending'               │
│  first_score_at        TIMESTAMP                        │
│  last_score_at         TIMESTAMP                        │
│  created_at            TIMESTAMP DEFAULT NOW            │
│  updated_at            TIMESTAMP DEFAULT NOW            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Column Descriptions

| Column | Tipe | Nullable | Default | Fungsi |
|--------|------|----------|---------|--------|
| `id` | UUID | No | auto | ID unik entry |
| `season_id` | UUID | No | — | Musim/periode. FK → leaderboard_seasons |
| `player_id` | UUID | No | — | Pemain. FK → players |
| `score` | BigInt | No | 0 | Score pemain dalam periode ini |
| `rank` | Integer | Yes | null | Peringkat (dihitung saat periode closed) |
| `reward_diamond` | Integer | No | 0 | Diamond reward berdasarkan rank |
| `reward_status` | Enum | No | 'pending' | Status: pending, claimed, expired |
| `first_score_at` | Timestamp | No | — | Waktu pertama kali score > 0 (tie-breaker) |
| `last_score_at` | Timestamp | No | — | Waktu terakhir score berubah |
| `created_at` | Timestamp | No | NOW() | Waktu record dibuat |
| `updated_at` | Timestamp | No | NOW() | Waktu terakhir update |

### Indexes

| Index | Columns | Purpose |
|-------|---------|---------|
| PRIMARY | `id` | Unique identifier |
| UNIQUE | `season_id, player_id` | Satu entry per player per season |
| INDEX | `season_id, score DESC` | Leaderboard ranking query |
| INDEX | `player_id` | Cari entry per pemain |
| INDEX | `reward_status` | Filter belum claim |

### Tie-Breaker Rule

```
Jika score sama:
  Pemain dengan first_score_at lebih awal = rank lebih tinggi

Contoh:
  Player A: score=100, first_score_at=10:00 → rank 1
  Player B: score=100, first_score_at=10:05 → rank 2
```

---

## 6. Table: mails

### Purpose

Menyimpan pesan/hadiah yang dikirim ke pemain. Bisa berisi Diamond reward dari leaderboard atau event.

### Schema

```
┌─────────────────────────────────────────────────────────┐
│                     TABLE: mails                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  id                    UUID (PK)                        │
│  player_id             UUID (FK → players.id)           │
│  title                 VARCHAR(200)                     │
│  content               TEXT                             │
│  reward_type           ENUM('diamond','none')           │
│                         DEFAULT 'none'                  │
│  reward_amount         INTEGER DEFAULT 0                │
│  claim_status          ENUM('unclaimed','claimed',      │
│                             'expired')                  │
│                         DEFAULT 'unclaimed'             │
│  is_read               BOOLEAN DEFAULT FALSE            │
│  created_at            TIMESTAMP DEFAULT NOW            │
│  claimed_at            TIMESTAMP (nullable)             │
│  expired_at            TIMESTAMP (nullable)             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Column Descriptions

| Column | Tipe | Nullable | Default | Fungsi |
|--------|------|----------|---------|--------|
| `id` | UUID | No | auto | ID unik mail |
| `player_id` | UUID | No | — | Penerima mail. FK → players |
| `title` | VARCHAR(200) | No | — | Judul mail |
| `content` | Text | No | — | Isi pesan |
| `reward_type` | Enum | No | 'none' | Jenis hadiah: diamond atau none |
| `reward_amount` | Integer | No | 0 | Jumlah Diamond (0 jika none) |
| `claim_status` | Enum | No | 'unclaimed' | Status: unclaimed, claimed, expired |
| `is_read` | Boolean | No | false | Sudah dibaca atau belum |
| `created_at` | Timestamp | No | NOW() | Waktu mail dikirim |
| `claimed_at` | Timestamp | Yes | null | Waktu hadiah di-claim |
| `expired_at` | Timestamp | Yes | null | Waktu mail kadaluarsa |

### Indexes

| Index | Columns | Purpose |
|-------|---------|---------|
| PRIMARY | `id` | Unique identifier |
| INDEX | `player_id` | Mail per pemain |
| INDEX | `claim_status` | Filter unclaimed mails |
| INDEX | `expired_at` | Cleanup expired mails |
| INDEX | `created_at` | Sort by newest |

### Mail States

```
UNCLAIMED ──claim──▶ CLAIMED
     │
     └──expiry──▶ EXPIRED
```

---

## 7. Table: shop_products

### Purpose

Menyimpan daftar produk Diamond yang bisa dibeli pemain.

### Schema

```
┌─────────────────────────────────────────────────────────┐
│                 TABLE: shop_products                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  id                    UUID (PK)                        │
│  product_name          VARCHAR(100)                     │
│  description           TEXT (nullable)                  │
│  diamond_amount        INTEGER                          │
│  price                 DECIMAL(12,2)                    │
│  currency              VARCHAR(3) DEFAULT 'IDR'         │
│  status                ENUM('active','inactive',        │
│                             'sold_out')                 │
│                         DEFAULT 'active'                │
│  display_order         INTEGER DEFAULT 0                │
│  created_at            TIMESTAMP DEFAULT NOW            │
│  updated_at            TIMESTAMP DEFAULT NOW            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Column Descriptions

| Column | Tipe | Nullable | Default | Fungsi |
|--------|------|----------|---------|--------|
| `id` | UUID | No | auto | ID unik produk |
| `product_name` | VARCHAR(100) | No | — | Nama tampilan: "Starter Pack" |
| `description` | Text | Yes | null | Deskripsi produk |
| `diamond_amount` | Integer | No | — | Jumlah Diamond yang diterima |
| `price` | Decimal(12,2) | No | — | Harga dalam mata uang lokal |
| `currency` | VARCHAR(3) | No | 'IDR' | Kode mata uang |
| `status` | Enum | No | 'active' | Status: active, inactive, sold_out |
| `display_order` | Integer | No | 0 | Urutan tampilan di Shop |
| `created_at` | Timestamp | No | NOW() | Waktu dibuat |
| `updated_at` | Timestamp | No | NOW() | Waktu terakhir update |

### Indexes

| Index | Columns | Purpose |
|-------|---------|---------|
| PRIMARY | `id` | Unique identifier |
| INDEX | `status` | Filter active products |
| INDEX | `display_order` | Sort by display order |

### Sample Products

| Product Name | Diamond | Price | Status |
|-------------|---------|-------|--------|
| Starter Pack | 10 | 5,000 | active |
| Basic Pack | 50 | 20,000 | active |
| Mega Pack | 200 | 50,000 | active |
| Ultimate Pack | 500 | 100,000 | active |

---

## 8. Table: purchases

### Purpose

Menyimpan record setiap kali pemain melakukan pembelian Diamond.

### Schema

```
┌─────────────────────────────────────────────────────────┐
│                   TABLE: purchases                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  id                    UUID (PK)                        │
│  player_id             UUID (FK → players.id)           │
│  product_id            UUID (FK → shop_products.id)     │
│  payment_id            UUID (FK → payments.id)          │
│  diamond_amount        INTEGER                          │
│  price_paid            DECIMAL(12,2)                    │
│  currency              VARCHAR(3)                       │
│  status                ENUM('pending','completed',      │
│                             'failed','refunded')        │
│                         DEFAULT 'pending'               │
│  created_at            TIMESTAMP DEFAULT NOW            │
│  completed_at          TIMESTAMP (nullable)             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Column Descriptions

| Column | Tipe | Nullable | Default | Fungsi |
|--------|------|----------|---------|--------|
| `id` | UUID | No | auto | ID unik pembelian |
| `player_id` | UUID | No | — | Pembeli. FK → players |
| `product_id` | UUID | No | — | Produk yang dibeli. FK → shop_products |
| `payment_id` | UUID | No | — | Record pembayaran. FK → payments |
| `diamond_amount` | Integer | No | — | Diamond yang diterima (snapshot) |
| `price_paid` | Decimal(12,2) | No | — | Harga yang dibayar (snapshot) |
| `currency` | VARCHAR(3) | No | — | Mata uang (snapshot) |
| `status` | Enum | No | 'pending' | Status: pending, completed, failed, refunded |
| `created_at` | Timestamp | No | NOW() | Waktu transaksi dibuat |
| `completed_at` | Timestamp | Yes | null | Waktu pembayaran selesai |

### Indexes

| Index | Columns | Purpose |
|-------|---------|---------|
| PRIMARY | `id` | Unique identifier |
| INDEX | `player_id` | Pembelian per pemain |
| INDEX | `status` | Filter by status |
| INDEX | `created_at` | Sort by date |

---

## 9. Table: payments

### Purpose

Menyimpan record pembayaran dari payment gateway. Terpisah dari purchases untuk audit trail yang lebih bersih.

### Schema

```
┌─────────────────────────────────────────────────────────┐
│                    TABLE: payments                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  id                    UUID (PK)                        │
│  purchase_id           UUID (FK → purchases.id)         │
│  payment_method        VARCHAR(50)                      │
│  external_transaction_id VARCHAR(200) (nullable)        │
│  amount                DECIMAL(12,2)                    │
│  currency              VARCHAR(3)                       │
│  status                ENUM('pending','success',        │
│                             'failed','cancelled',       │
│                             'refunded')                 │
│                         DEFAULT 'pending'               │
│  gateway_response      JSON (nullable)                  │
│  created_at            TIMESTAMP DEFAULT NOW            │
│  paid_at               TIMESTAMP (nullable)             │
│  updated_at            TIMESTAMP DEFAULT NOW            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Column Descriptions

| Column | Tipe | Nullable | Default | Fungsi |
|--------|------|----------|---------|--------|
| `id` | UUID | No | auto | ID unik pembayaran |
| `purchase_id` | UUID | No | — | Record pembelian terkait. FK → purchases |
| `payment_method` | VARCHAR(50) | No | — | Metode: credit_card, e_wallet, bank_transfer |
| `external_transaction_id` | VARCHAR(200) | Yes | null | ID transaksi dari payment gateway |
| `amount` | Decimal(12,2) | No | — | Jumlah yang dibayar |
| `currency` | VARCHAR(3) | No | — | Mata uang |
| `status` | Enum | No | 'pending' | Status pembayaran |
| `gateway_response` | JSON | Yes | null | Raw response dari gateway (untuk debugging) |
| `created_at` | Timestamp | No | NOW() | Waktu record dibuat |
| `paid_at` | Timestamp | Yes | null | Waktu pembayaran berhasil |
| `updated_at` | Timestamp | No | NOW() | Waktu terakhir update |

### Indexes

| Index | Columns | Purpose |
|-------|---------|---------|
| PRIMARY | `id` | Unique identifier |
| INDEX | `purchase_id` | Link ke purchase |
| INDEX | `external_transaction_id` | Cari by gateway ID |
| INDEX | `status` | Filter by status |

---

## 10. Table: transactions

### Purpose

Menyimpan seluruh perubahan Diamond sebagai audit trail. Setiap kali Diamond bertambah atau berkurang, record baru dibuat.

### Schema

```
┌─────────────────────────────────────────────────────────┐
│                  TABLE: transactions                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  id                    UUID (PK)                        │
│  player_id             UUID (FK → players.id)           │
│  type                  ENUM('purchase','leaderboard',   │
│                             'auto_mining','admin',      │
│                             'mail_claim','refund')      │
│  amount                INTEGER                          │
│  balance_before        INTEGER                          │
│  balance_after         INTEGER                          │
│  reference_type        VARCHAR(50) (nullable)           │
│  reference_id          UUID (nullable)                  │
│  description           VARCHAR(500) (nullable)          │
│  created_at            TIMESTAMP DEFAULT NOW            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Column Descriptions

| Column | Tipe | Nullable | Default | Fungsi |
|--------|------|----------|---------|--------|
| `id` | UUID | No | auto | ID unik transaksi |
| `player_id` | UUID | No | — | Pemain yang Diamond-nya berubah |
| `type` | Enum | No | — | Tipe: purchase, leaderboard, auto_mining, admin, mail_claim, refund |
| `amount` | Integer | No | — | Perubahan: positif (+) atau negatif (-) |
| `balance_before` | Integer | No | — | Saldo Diamond SEBELUM perubahan |
| `balance_after` | Integer | No | — | Saldo Diamond SESUDAH perubahan |
| `reference_type` | VARCHAR(50) | Yes | null | Tipe referensi: 'purchase', 'mail', 'auto_mining' |
| `reference_id` | UUID | Yes | null | ID referensi (purchase_id, mail_id, dll) |
| `description` | VARCHAR(500) | Yes | null | Deskripsi singkat perubahan |
| `created_at` | Timestamp | No | NOW() | Waktu transaksi terjadi |

### Indexes

| Index | Columns | Purpose |
|-------|---------|---------|
| PRIMARY | `id` | Unique identifier |
| INDEX | `player_id` | Transaksi per pemain |
| INDEX | `type` | Filter by type |
| INDEX | `created_at` | Sort by date |
| INDEX | `reference_type, reference_id` | Cari by reference |

### Transaction Types

| Type | Amount | Description |
|------|--------|-------------|
| `purchase` | +N | Pembelian Diamond dari Shop |
| `leaderboard` | +N | Hadiah dari leaderboard |
| `auto_mining` | -N | Biaya Auto Mining |
| `admin` | ±N | Manual adjustment oleh admin |
| `mail_claim` | +N | Claim hadiah dari Mail |
| `refund` | -N | Refund pembelian |

---

## 11. Table: system_settings

### Purpose

Menyimpan konfigurasi game yang bisa diubah tanpa ubah kode. Semua setting ada di tabel ini.

### Schema

```
┌─────────────────────────────────────────────────────────┐
│                TABLE: system_settings                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  id                    UUID (PK)                        │
│  setting_key           VARCHAR(100) (UNIQUE)            │
│  setting_value         TEXT                             │
│  setting_type          ENUM('string','number','boolean', │
│                             'json')                     │
│  description           VARCHAR(500) (nullable)          │
│  created_at            TIMESTAMP DEFAULT NOW            │
│  updated_at            TIMESTAMP DEFAULT NOW            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Column Descriptions

| Column | Tipe | Nullable | Default | Fungsi |
|--------|------|----------|---------|--------|
| `id` | UUID | No | auto | ID unik setting |
| `setting_key` | VARCHAR(100) | No | — | Nama setting (unique) |
| `setting_value` | Text | No | — | Nilai setting |
| `setting_type` | Enum | No | — | Tipe: string, number, boolean, json |
| `description` | VARCHAR(500) | Yes | null | Deskripsi kegunaan |
| `created_at` | Timestamp | No | NOW() | Waktu dibuat |
| `updated_at` | Timestamp | No | NOW() | Waktu terakhir diubah |

### Indexes

| Index | Columns | Purpose |
|-------|---------|---------|
| PRIMARY | `id` | Unique identifier |
| UNIQUE | `setting_key` | Cari by key |

### Sample Settings

| Key | Value | Type | Description |
|-----|-------|------|-------------|
| `auto_mining_basic_price` | 1000 | number | Diamond cost for basic pack |
| `auto_mining_basic_duration` | 18000 | number | Duration in seconds |
| `auto_mining_premium_price` | 5000 | number | Diamond cost for premium pack |
| `auto_mining_premium_duration` | 86400 | number | Duration in seconds |
| `leaderboard_daily_reward_1` | 50 | number | Diamond reward for rank 1 daily |
| `leaderboard_daily_reward_2` | 30 | number | Diamond reward for rank 2 daily |
| `leaderboard_daily_reward_3` | 20 | number | Diamond reward for rank 3 daily |
| `mail_default_expiry_days` | 7 | number | Default mail expiry in days |
| `maintenance_mode` | false | boolean | Maintenance mode toggle |
| `max_taps_per_second` | 20 | number | Anti-cheat rate limit |

---

## 12. Table: admin_logs

### Purpose

Mencatat seluruh aktivitas admin untuk audit dan debugging.

### Schema

```
┌─────────────────────────────────────────────────────────┐
│                  TABLE: admin_logs                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  id                    UUID (PK)                        │
│  admin_id              UUID (FK → players.id)           │
│  action                VARCHAR(100)                     │
│  target_type           VARCHAR(50) (nullable)           │
│  target_id             UUID (nullable)                  │
│  description           TEXT (nullable)                  │
│  old_value             JSON (nullable)                  │
│  new_value             JSON (nullable)                  │
│  ip_address            VARCHAR(45) (nullable)           │
│  created_at            TIMESTAMP DEFAULT NOW            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Column Descriptions

| Column | Tipe | Nullable | Default | Fungsi |
|--------|------|----------|---------|--------|
| `id` | UUID | No | auto | ID unik log |
| `admin_id` | UUID | No | — | Admin yang melakukan aksi. FK → players |
| `action` | VARCHAR(100) | No | — | Aksi: 'ban_player', 'send_mail', 'update_product' |
| `target_type` | VARCHAR(50) | Yes | null | Target: 'player', 'product', 'mail' |
| `target_id` | UUID | Yes | null | ID target yang diubah |
| `description` | Text | Yes | null | Deskripsi aksi |
| `old_value` | JSON | Yes | null | Nilai sebelum diubah |
| `new_value` | JSON | Yes | null | Nilai sesudah diubah |
| `ip_address` | VARCHAR(45) | Yes | null | IP address admin |
| `created_at` | Timestamp | No | NOW() | Waktu aksi terjadi |

### Indexes

| Index | Columns | Purpose |
|-------|---------|---------|
| PRIMARY | `id` | Unique identifier |
| INDEX | `admin_id` | Log per admin |
| INDEX | `action` | Filter by action |
| INDEX | `target_type, target_id` | Cari by target |
| INDEX | `created_at` | Sort by date |

---

## 13. Entity Relationships

### Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    ENTITY RELATIONSHIPS                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐                                                   │
│  │ players  │                                                   │
│  └────┬─────┘                                                   │
│       │                                                         │
│       │ 1                                                       │
│       ├──────── 0..1 ┌──────────────┐                           │
│       │               │ auto_mining  │                           │
│       │               └──────────────┘                           │
│       │                                                         │
│       │ 1                                                       │
│       ├──────── N ┌────────────────────┐                         │
│       │           │ leaderboard_entries│                         │
│       │           └────────┬───────────┘                         │
│       │                    │ N                                  │
│       │                    └──1 ┌───────────────────┐           │
│       │                         │leaderboard_seasons│           │
│       │                         └───────────────────┘           │
│       │                                                         │
│       │ 1                                                       │
│       ├──────── N ┌──────────┐                                  │
│       │           │  mails   │                                  │
│       │           └──────────┘                                  │
│       │                                                         │
│       │ 1                                                       │
│       ├──────── N ┌───────────┐                                 │
│       │           │ purchases │                                 │
│       │           └─────┬─────┘                                 │
│       │                 │ N                                     │
│       │                 └──1 ┌──────────┐                       │
│       │                      │ payments │                       │
│       │                      └──────────┘                       │
│       │                                                         │
│       │ 1                                                       │
│       ├──────── N ┌──────────────┐                              │
│       │           │ transactions │                              │
│       │           └──────────────┘                              │
│       │                                                         │
│       │ 1                                                       │
│       └──────── N ┌────────────┐                                │
│                   │ admin_logs │                                │
│                   └────────────┘                                │
│                                                                 │
│  ┌─────────────────┐                                            │
│  │ shop_products   │ ◄── referenced by purchases                │
│  └─────────────────┘                                            │
│                                                                 │
│  ┌─────────────────┐                                            │
│  │ system_settings │ (standalone, no FK)                        │
│  └─────────────────┘                                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Relationship Summary

| Parent | Child | Cardinality | FK Column | Description |
|--------|-------|-------------|-----------|-------------|
| players | auto_mining | 1 : 0..1 | `player_id` | Satu pemain, maksimal satu sesi aktif |
| players | leaderboards | 1 : N | `player_id` | Satu pemain, banyak entry (satu per season) |
| leaderboard_seasons | leaderboards | 1 : N | `season_id` | Satu season, banyak entry pemain |
| players | mails | 1 : N | `player_id` | Satu pemain, banyak mail |
| players | purchases | 1 : N | `player_id` | Satu pemain, banyak pembelian |
| shop_products | purchases | 1 : N | `product_id` | Satu produk, banyak dibeli |
| payments | purchases | 1 : 1 | `payment_id` | Satu pembayaran, satu pembelian |
| players | transactions | 1 : N | `player_id` | Satu pemain, banyak transaksi Diamond |
| players | admin_logs | 1 : N | `admin_id` | Satu admin, banyak log aksi |

---

## 14. Query Patterns

### Common Queries

```
LEADERBOARD:
  SELECT * FROM leaderboards
  WHERE season_id = ? AND score > 0
  ORDER BY score DESC, first_score_at ASC
  LIMIT 20

PLAYER SCORE UPDATE:
  UPDATE players SET total_score = total_score + 1
  WHERE id = ?

DIAMOND SPEND:
  UPDATE players SET total_diamond = total_diamond - ?
  WHERE id = ? AND total_diamond >= ?

AUTO MINING ACTIVE:
  SELECT * FROM auto_mining
  WHERE player_id = ? AND status = 'active'

MAIL UNCLAIMED:
  SELECT * FROM mails
  WHERE player_id = ? AND claim_status = 'unclaimed'
  ORDER BY created_at DESC

TRANSACTION HISTORY:
  SELECT * FROM transactions
  WHERE player_id = ?
  ORDER BY created_at DESC
  LIMIT 20

CLEANUP EXPIRED MAIL:
  UPDATE mails SET claim_status = 'expired'
  WHERE claim_status = 'unclaimed'
  AND expired_at < NOW()
```

### Performance Considerations

| Query | Optimization |
|-------|-------------|
| Leaderboard ranking | Index on `(season_id, score DESC, first_score_at ASC)` |
| Player lookup | Index on `telegram_id` (unique) |
| Auto Mining check | Partial index on `(player_id) WHERE status='active'` |
| Mail inbox | Index on `(player_id, claim_status)` |
| Transaction history | Index on `(player_id, created_at DESC)` |
| Expired mail cleanup | Index on `(expired_at)` |
