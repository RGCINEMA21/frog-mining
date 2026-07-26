# 🐸 Frog Mining — API Specification & Standards

> **Dokumen ini menjadi pedoman resmi seluruh API Frog Mining.**
> Semua endpoint yang dibuat harus mengikuti standar ini.

---

## 1. Overview

### Communication Model

```
┌─────────────────────────────────────────────────────────┐
│                  COMMUNICATION MODEL                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐        REST API        ┌───────────┐  │
│  │              │◀══════════════════════▶│           │  │
│  │   Frontend   │     (JSON over HTTP)   │  Backend  │  │
│  │   (Client)   │                        │  (Server) │  │
│  │              │◀──────────────────────▶│           │  │
│  └──────────────┘    WebSocket (optional) └───────────┘  │
│                                                         │
│  Rules:                                                 │
│  ├── Semua komunikasi via REST API                       │
│  ├── Semua data berformat JSON                           │
│  ├── Frontend TIDAK boleh akses database langsung        │
│  ├── Semua data harus melalui Backend                    │
│  └── Backend = Single Source of Truth                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 2. API Modules

### Module Overview

| Module | Prefix | Fungsi |
|--------|--------|--------|
| **Auth** | `/auth` | Autentikasi pemain, kelola session |
| **Player** | `/player` | Kelola data pemain |
| **Score** | `/score` | Kelola Score |
| **Diamond** | `/diamond` | Kelola Diamond |
| **Auto Mining** | `/mining` | Kelola Auto Mining |
| **Leaderboard** | `/board` | Ambil data leaderboard |
| **Mail** | `/mail` | Kelola Mail dan claim hadiah |
| **Shop** | `/shop` | Daftar produk dan beli |
| **Payment** | `/pay` | Proses pembayaran |
| **Transaction** | `/transaction` | Riwayat transaksi |
| **Admin** | `/admin` | Manajemen (khusus admin) |

### Module Descriptions

#### Auth Module (`/auth`)

```
Fungsi:
├── Login pemain (Telegram Mini App / username)
├── Buat JWT token
├── Validasi token
├── Refresh token
├── Logout
└── Handle session expiry

Flow:
  Client → POST /auth/login → Server → JWT token
  Client → GET /any endpoint + JWT → Server → Validasi
  Client → POST /auth/logout → Server → Hapus session
```

#### Player Module (`/player`)

```
Fungsi:
├── Ambil data pemain
├── Update profil (username, foto)
├── Ambil statistik pemain
├── Export data pemain
└── Handle status akun

Data:
├── Player ID
├── Username
├── Profile Photo
├── Total Score
├── Total Diamond
├── Joined At
└── Last Login At
```

#### Score Module (`/score`)

```
Fungsi:
├── Proses tap (Score += 1)
├── Ambil Score saat ini
├── Ambil Score per periode
├── Validasi Score tidak negatif
└── Rate limiting

Validasi:
├── newScore >= 0
├── Rate limit: max 20 taps/detik
└── Server hitung, bukan client
```

#### Diamond Module (`/diamond`)

```
Fungsi:
├── Ambil saldo Diamond
├── Tambah Diamond (dari leaderboard/shop)
├── Kurangi Diamond (untuk auto mining)
├── Validasi Diamond tidak negatif
└── History perubahan Diamond

Sumber:
├── add(amount, 'leaderboard')
├── add(amount, 'shop')
└── spend(amount, 'auto-mining')
```

#### Auto Mining Module (`/mining`)

```
Fungsi:
├── Aktifkan Auto Mining (beli paket)
├── Ambil status Auto Mining
├── Ambil sisa durasi
├── Hitung offline mining
└── Berhenti otomatis saat habis

Paket:
├── Basic:  💎1,000 = 5 jam
└── Premium: 💎5,000 = 24 jam

Validasi:
├── Diamond cukup
├── Belum ada sesi aktif
└── Timer valid
```

#### Leaderboard Module (`/board`)

```
Fungsi:
├── Ambil leaderboard harian
├── Ambil leaderboard mingguan
├── Ambil leaderboard bulanan
├── Ambil posisi pemain
└── Ambil countdown reset

Data:
├── Ranking
├── Username
├── Score
├── Periode
└── Countdown reset
```

#### Mail Module (`/mail`)

```
Fungsi:
├── Ambil daftar Mail
├── Ambil detail Mail
├── Claim hadiah Mail
├── Tandai Mail sudah dibaca
└── Handle Mail expiry

Status:
├── UNCLAIMED → bisa claim
├── CLAIMED → selesai
└── EXPIRED → tidak bisa claim

Validasi:
├── Status == UNCLAIMED
├── Belum expired
└── Claim 1x saja
```

#### Shop Module (`/shop`)

```
Fungsi:
├── Ambil daftar produk
├── Ambil detail produk
├── Inisiasi pembelian
└── Handle status produk

Status Produk:
├── ACTIVE → tersedia
├── INACTIVE → tidak ditampilkan
└── SOLD_OUT → tidak bisa beli
```

#### Payment Module (`/pay`)

```
Fungsi:
├── Buat transaksi baru
├── Redirect ke payment gateway
├── Terima callback
├── Verifikasi pembayaran
└── Handle success/fail/cancel

Flow:
  1. Client → POST /pay/create → Server → Payment URL
  2. Client → Redirect ke gateway
  3. Gateway → POST /pay/callback → Server → Verifikasi
  4. Server → Tambah Diamond jika success
```

#### Transaction Module (`/transaction`)

```
Fungsi:
├── Ambil riwayat transaksi
├── Ambil detail transaksi
├── Snapshot harga saat transaksi
└── Audit trail

Data:
├── Transaction ID
├── Product
├── Amount Paid
├── Payment Method
├── Status
└── Timestamp
```

#### Admin Module (`/admin`)

```
Fungsi:
├── Dashboard overview
├── Kelola produk
├── Kelola akun pemain
├── Kirim Mail manual
├── Lihat log
└── Monitor performa

Akses:
├── Hanya admin terautentikasi
├── Role-based access
└── Semua aksi tercatat di log
```

---

## 3. Request Standards

### URL Structure

```
Format:
  /api/{version}/{module}/{action}

Contoh:
  /api/v1/auth/login
  /api/v1/player/me
  /api/v1/score/tap
  /api/v1/mining/activate
  /api/v1/board/daily
  /api/v1/mail/claim/{mailId}
  /api/v1/shop/products
  /api/v1/pay/create
  /api/v1/transaction/history
  /api/v1/admin/players
```

### HTTP Methods

| Method | Kegunaan | Contoh |
|--------|----------|--------|
| **GET** | Ambil data | `GET /api/v1/player/me` |
| **POST** | Buat data / eksekusi action | `POST /api/v1/score/tap` |
| **PUT** | Update data lengkap | `PUT /api/v1/player/profile` |
| **PATCH** | Update sebagian data | `PATCH /api/v1/player/username` |
| **DELETE** | Hapus data | `DELETE /api/v1/mail/{id}` |

### Naming Convention

```
Endpoint:
├── Gunakan lowercase
├── Gunakan hyphens (-) untuk multi-word
├── Gunakan nouns untuk resource
├── Gunakan verbs untuk actions
└── Gunakan plural untuk collection

Contoh:
  ✅ /api/v1/player/me
  ✅ /api/v1/score/tap
  ✅ /api/v1/mining/activate
  ✅ /api/v1/mail/claim/{id}
  ✅ /api/v1/board/daily
  ✅ /api/v1/shop/products
  ✅ /api/v1/pay/create

  ❌ /api/v1/getPlayer
  ❌ /api/v1/Player/Me
  ❌ /api/v1/player_get
  ❌ /api/v1/player/{id}/getScore
```

### Authentication Header

```
Semua request yang membutuhkan autentikasi harus menyertakan:

  Authorization: Bearer {JWT_TOKEN}

Contoh:
  GET /api/v1/player/me
  Headers:
    Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
    Content-Type: application/json
```

### Request Body

```
Format:
  Content-Type: application/json

Contoh:
  POST /api/v1/auth/login
  Body:
    {
      "username": "FrogMaster",
      "telegramData": "..."
    }

  POST /api/v1/score/tap
  Body: (tidak perlu, hanya butuh token)

  POST /api/v1/mining/activate
  Body:
    {
      "package": "basic"
    }

  POST /api/v1/mail/claim/{mailId}
  Body: (tidak perlu)
```

### Query Parameters

```
Untuk filter, sort, pagination:

GET /api/v1/board/daily?page=1&limit=20
GET /api/v1/transaction/history?page=1&limit=10&status=completed
GET /api/v1/mail?status=unclaimed

Parameter:
├── page: nomor halaman (default: 1)
├── limit: jumlah data per halaman (default: 20, max: 100)
├── sort: field untuk sorting (default: descending)
└── filter: filter data (tipe-dependent)
```

---

## 4. Response Standards

### Success Response

```
Format:
  {
    "success": true,
    "data": { ... },
    "timestamp": "2025-01-15T10:30:00Z"
  }

Contoh:
  GET /api/v1/player/me
  Response:
    {
      "success": true,
      "data": {
        "id": "uuid-xxxx",
        "username": "FrogMaster",
        "totalScore": 12450,
        "totalDiamond": 25,
        "joinedAt": "2025-01-10T08:00:00Z",
        "lastLoginAt": "2025-01-15T10:30:00Z"
      },
      "timestamp": "2025-01-15T10:30:00Z"
    }
```

### Response Fields

| Field | Tipe | Keterangan |
|-------|------|------------|
| `success` | Boolean | `true` jika berhasil |
| `data` | Object/Array | Data yang diminta (ada jika success) |
| `message` | String | Pesan (ada jika error) |
| `error` | Object | Detail error (ada jika error) |
| `timestamp` | String | Waktu response (ISO 8601) |
| `pagination` | Object | Info pagination (ada jika list) |

### Pagination Response

```
GET /api/v1/board/daily?page=1&limit=20
Response:
  {
    "success": true,
    "data": [
      { "rank": 1, "username": "FrogMaster", "score": 12450 },
      { "rank": 2, "username": "SwampKing", "score": 11200 }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    },
    "timestamp": "2025-01-15T10:30:00Z"
  }
```

### No Content Response

```
Untuk operasi yang tidak mengembalikan data:

  DELETE /api/v1/mail/{id}
  Response: 204 No Content
```

---

## 5. Error Standards

### Error Response Format

```
Format:
  {
    "success": false,
    "error": {
      "code": "ERROR_CODE",
      "message": "Deskripsi error"
    },
    "timestamp": "2025-01-15T10:30:00Z"
  }
```

### HTTP Status Codes

| Code | Kegunaan | Contoh |
|------|----------|--------|
| **200** | OK | Request berhasil |
| **201** | Created | Resource baru dibuat |
| **204** | No Content | Operasi berhasil, tanpa data |
| **400** | Bad Request | Input tidak valid |
| **401** | Unauthorized | Tidak terautentikasi |
| **403** | Forbidden | Tidak punya akses |
| **404** | Not Found | Resource tidak ditemukan |
| **409** | Conflict | Konflik data (double claim) |
| **422** | Unprocessable | Validasi bisnis gagal |
| **429** | Too Many Requests | Rate limit terlampaui |
| **500** | Internal Server Error | Error server |

### Error Codes

#### Authentication Errors

| Code | HTTP | Message | Kondisi |
|------|------|---------|---------|
| `ERR_UNAUTHORIZED` | 401 | "Tidak terautentikasi" | Token tidak ada |
| `ERR_TOKEN_EXPIRED` | 401 | "Token sudah expired" | Token kadaluarsa |
| `ERR_TOKEN_INVALID` | 401 | "Token tidak valid" | Token rusak/salah |
| `ERR_FORBIDDEN` | 403 | "Tidak punya akses" | Bukan admin |

#### Validation Errors

| Code | HTTP | Message | Kondisi |
|------|------|---------|---------|
| `ERR_INVALID_INPUT` | 400 | "Input tidak valid" | Field wajib kosong |
| `ERR_INVALID_USERNAME` | 400 | "Username tidak valid" | Format salah |
| `ERR_INVALID_PACKAGE` | 400 | "Paket tidak valid" | Paket tidak dikenal |

#### Business Logic Errors

| Code | HTTP | Message | Kondisi |
|------|------|---------|---------|
| `ERR_SCORE_NEGATIVE` | 422 | "Score tidak boleh negatif" | Score < 0 |
| `ERR_DIAMOND_NEGATIVE` | 422 | "Diamond tidak boleh negatif" | Diamond < 0 |
| `ERR_INSUFFICIENT_DIAMONDS` | 422 | "Diamond tidak cukup" | Diamond < biaya |
| `ERR_AUTO_MINING_ACTIVE` | 422 | "Auto Mining sudah aktif" | Sudah ada sesi |
| `ERR_AUTO_MINING_NOT_ACTIVE` | 422 | "Auto Mining tidak aktif" | Tidak ada sesi |
| `ERR_MAIL_CLAIMED` | 422 | "Mail sudah diklaim" | Status bukan unclaimed |
| `ERR_MAIL_EXPIRED` | 422 | "Mail sudah kedaluwarsa" | Lewat expiry |
| `ERR_PRODUCT_INACTIVE` | 422 | "Produk tidak tersedia" | Status inactive |
| `ERR_PAYMENT_FAILED` | 422 | "Pembayaran gagal" | Gateway reject |
| `ERR_RATE_LIMIT` | 429 | "Terlalu banyak request" | Rate limit |

#### Resource Errors

| Code | HTTP | Message | Kondisi |
|------|------|---------|---------|
| `ERR_NOT_FOUND` | 404 | "Data tidak ditemukan" | Resource不存在 |
| `ERR_PLAYER_NOT_FOUND` | 404 | "Pemain tidak ditemukan" | Player ID invalid |
| `ERR_MAIL_NOT_FOUND` | 404 | "Mail tidak ditemukan" | Mail ID invalid |
| `ERR_PRODUCT_NOT_FOUND` | 404 | "Produk tidak ditemukan" | Product ID invalid |

#### System Errors

| Code | HTTP | Message | Kondisi |
|------|------|---------|---------|
| `ERR_INTERNAL` | 500 | "Terjadi kesalahan server" | Error tak terduga |
| `ERR_DATABASE` | 500 | "Database error" | DB connection gagal |
| `ERR_PAYMENT_GATEWAY` | 502 | "Payment gateway error" | Gateway down |

---

## 6. Authentication System

### Auth Flow

```
┌─────────────────────────────────────────────────────────┐
│                  AUTHENTICATION FLOW                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────┐        │
│  │  Scenario 1: Telegram Mini App              │        │
│  │                                             │        │
│  │  1. Pemain buka game di Telegram            │        │
│  │  2. Telegram kirim init data                │        │
│  │  3. Client kirim ke POST /auth/login        │        │
│  │  4. Server verifikasi init data             │        │
│  │  5. Server buat/restore player              │        │
│  │  6. Server generate JWT token               │        │
│  │  7. Client simpan token                     │        │
│  │  8. Client kirim token di setiap request    │        │
│  └─────────────────────────────────────────────┘        │
│                                                         │
│  ┌─────────────────────────────────────────────┐        │
│  │  Scenario 2: Web Browser (Future)           │        │
│  │                                             │        │
│  │  1. Pemain buka website                     │        │
│  │  2. Pemain ketik username                   │        │
│  │  3. Client kirim ke POST /auth/login        │        │
│  │  4. Server buat player baru                 │        │
│  │  5. Server generate JWT token               │        │
│  │  6. Client simpan token                     │        │
│  │  7. Client kirim token di setiap request    │        │
│  └─────────────────────────────────────────────┘        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Token Structure

```
JWT Token:
  Header:  { "alg": "HS256", "typ": "JWT" }
  Payload: {
    "playerId": "uuid-xxxx",
    "username": "FrogMaster",
    "iat": 1705312200,     // issued at
    "exp": 1705398600      // expires at (24 jam)
  }
  Signature: HMACSHA256(base64(header) + "." + base64(payload), secret)
```

### Token Lifecycle

```
┌─────────────────────────────────────────────────┐
│              TOKEN LIFECYCLE                      │
├─────────────────────────────────────────────────┤
│                                                 │
│  Login                                          │
│    │                                            │
│    ▼                                            │
│  ┌──────────┐                                   │
│  │ Generate │──▶ Token baru                     │
│  │ Token    │    Exp: 24 jam                    │
│  └──────────┘                                   │
│       │                                         │
│       ▼                                         │
│  ┌──────────┐                                   │
│  │  Valid   │◀── Client gunakan token           │
│  │  (24h)   │    di setiap request              │
│  └──────────┘                                   │
│       │                                         │
│       │ (24 jam berlalu)                        │
│       ▼                                         │
│  ┌──────────┐                                   │
│  │ Expired  │──▶ Client dapat 401               │
│  │          │    Harus login ulang              │
│  └──────────┘                                   │
│       │                                         │
│       ▼                                         │
│  ┌──────────┐                                   │
│  │ Re-login │──▶ Token baru                     │
│  └──────────┘                                   │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Session Management

```
Session Data (server-side):
├── Player ID
├── Token
├── Created At
├── Expires At
├── IP Address
└── User Agent

Session Rules:
├── Satu player bisa punya banyak session (multi-device)
├── Session expired otomatis setelah 24 jam
├   Logout menghapus session
└── Admin bisa menghapus session pemain
```

---

## 7. Security Rules

### API Security Checklist

```
┌─────────────────────────────────────────────────────────┐
│                 SECURITY RULES                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ✅ VALIDATION                                          │
│  ├── Semua request divalidasi server-side               │
│  ├── Input sanitization (prevent injection)             │
│  ├── Schema validation (tipe data, panjang, format)     │
│  └── Business rule validation                           │
│                                                         │
│  ✅ AUTHENTICATION                                      │
│  ├── JWT token wajib untuk semua endpoint terproteksi   │
│  ├── Token divalidasi di setiap request                 │
│  ├── Token expiry dienforce                             │
│  └── Session management                                 │
│                                                         │
│  ✅ AUTHORIZATION                                       │
│  ├── Player hanya bisa akses data sendiri               │
│  ├── Admin role untuk admin endpoints                   │
│  └── Tidak ada cross-player data access                 │
│                                                         │
│  ✅ ANTI-CHEAT                                          │
│  ├── Rate limiting: max 20 taps/detik                   │
│  ├── Score hanya dihitung server                        │
│  ├── Diamond hanya dihitung server                      │
│  ├── Impossible values ditolak                          │
│  └── Pattern detection (optional)                       │
│                                                         │
│  ✅ ANTI-DUPLICATION                                    │
│  ├── Mail claim: status check (1x only)                 │
│  ├── Purchase: transaction ID unik                      │
│  ├── Auto Mining: 1 sesi aktif per player               │
│  └── Idempotency key untuk kritikal operations          │
│                                                         │
│  ✅ AUDIT                                               │
│  ├── Semua perubahan Score logged                       │
│  ├── Semua perubahan Diamond logged                     │
│  ├── Semua transaksi tercatat                           │
│  └── Admin actions logged                               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Score Manipulation Prevention

```
Client mengirim: "Score saya 999999"

Server melakukan:
  1. Validasi: Score hanya bisa naik +1 per tap
  2. Cek: tap rate tidak melebihi batas
  3. Hitung: Score = oldScore + 1
  4. Abaikan: Score dari client
  5. Simpan: Score hasil hitungan server
  6. Log: "Score updated by server, client value ignored"
```

### Diamond Manipulation Prevention

```
Client mengirim: "Tambah 1000 Diamond"

Server melakukan:
  1. Validasi: sumber Diamond harus dari leaderboard/shop
  2. Cek: tidak ada sumber "manual" dari client
  3. Verifikasi: leaderboard reward = otomatis, shop = payment verified
  4. Abaikan: Diamond dari client
  5. Simpan: Diamond hasil validasi server
  6. Log: "Diamond change rejected, invalid source"
```

### Double Claim Prevention

```
Client mengirim: "Claim Mail #123" (dua kali)

Server melakukan:
  1. Cek: Mail status == UNCLAIMED?
  2. Jika sudah CLAIMED → return error ERR_MAIL_CLAIMED
  3. Jika UNCLAIMED → proses claim
  4. Update: Mail status = CLAIMED
  5. Tambah: Diamond ke pemain
  6. Log: "Mail claimed, Diamond added"
```

### Double Transaction Prevention

```
Client mengirim: "Beli paket" (dua kali sekaligus)

Server melakukan:
  1. Cek: apakah ada transaksi PENDING yang sama?
  2. Jika ada → return transaksi yang sudah ada (idempotent)
  3. Jika tidak → buat transaksi baru
  4. Setiap transaksi punya ID unik
  5. Log: "Transaction created/reused"
```

---

## 8. API Versioning

### Version Strategy

```
Format:
  /api/{version}/{module}/{action}

Versi:
  /api/v1/...  → Versi saat ini
  /api/v2/...  → Versi masa depan (jika breaking change)

Rule:
├── Minor changes (tambah field) = tetap v1
├── Breaking change (hapus/rename field) = buat v2
├── v1 tetap berjalan selama client masih pakai
└── Deprecation notice 6 bulan sebelum v1 ditutup
```

### Version Lifecycle

```
┌─────────────────────────────────────────────────┐
│              VERSION LIFECYCLE                    │
├─────────────────────────────────────────────────┤
│                                                 │
│  v1 (Current)                                   │
│  ├── Released: Jan 2025                         │
│  ├── Status: Active                             │
│  └── Supported: Yes                             │
│                                                 │
│  v2 (Future)                                    │
│  ├── Released: TBD                              │
│  ├── Status: Not released                       │
│  └── Supported: When released                   │
│                                                 │
│  Deprecation:                                   │
│  ├── Notice: 6 bulan sebelum ditutup            │
│  ├── Header: Deprecation: true                  │
│  └── Sunset: date (tanggal penutupan)           │
│                                                 │
└─────────────────────────────────────────────────┘
```

### What Constitutes a Breaking Change

```
Breaking Change (butuh v2):
├── Menghapus field dari response
├── Mengubah tipe field
├── Mengubah URL structure
├── Mengubah authentication method
└── Mengubah error code

Non-Breaking Change (tetap v1):
├── Menambah field baru ke response
├── Menambah endpoint baru
├── Menambah optional parameter
├── Menambah error code baru
└── Mengubah logic internal
```

---

## 9. Documentation Standards

### Endpoint Documentation Template

```
Setiap endpoint harus didokumentasikan dengan format berikut:

┌─────────────────────────────────────────────────┐
│  ENDPOINT: POST /api/v1/mining/activate         │
├─────────────────────────────────────────────────┤
│                                                 │
│  Tujuan:                                        │
│  Aktifkan Auto Mining dengan paket tertentu      │
│                                                 │
│  Authentication:                                │
│  Required (JWT Bearer token)                    │
│                                                 │
│  Request:                                       │
│  {                                              │
│    "package": "basic" | "premium"               │
│  }                                              │
│                                                 │
│  Response (200):                                │
│  {                                              │
│    "success": true,                             │
│    "data": {                                    │
│      "status": "active",                        │
│      "package": "basic",                        │
│      "startTime": "...",                        │
│      "endTime": "...",                          │
│      "diamonds": 4000                           │
│    }                                            │
│  }                                              │
│                                                 │
│  Error:                                         │
│  ├── 422 ERR_INSUFFICIENT_DIAMONDS              │
│  ├── 422 ERR_AUTO_MINING_ACTIVE                 │
│  └── 422 ERR_INVALID_PACKAGE                    │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Documentation Completeness

```
Setiap endpoint harus punya:
  ✅ Tujuan (apa yang dilakukan)
  ✅ Input (request body/params)
  ✅ Output (response body)
  ✅ Error (semua kemungkinan error)
  ✅ Authentication (perlu token atau tidak)
  ✅ HTTP Method
  ✅ URL lengkap
  ✅ Contoh request
  ✅ Contoh response
```

---

## 10. API Module Summary

### Quick Reference

| Module | Prefix | Methods | Auth | Fungsi Utama |
|--------|--------|---------|------|-------------|
| Auth | `/auth` | POST | Optional | Login, token |
| Player | `/player` | GET, PUT, PATCH | Required | Data pemain |
| Score | `/score` | GET, POST | Required | Score management |
| Diamond | `/diamond` | GET | Required | Diamond balance |
| Auto Mining | `/mining` | GET, POST | Required | Activate, status |
| Leaderboard | `/board` | GET | Optional | Ranking data |
| Mail | `/mail` | GET, POST, DELETE | Required | Mail, claim |
| Shop | `/shop` | GET | Optional | Product list |
| Payment | `/pay` | POST | Required | Process payment |
| Transaction | `/transaction` | GET | Required | History |
| Admin | `/admin` | GET, POST, PUT, DELETE | Admin | Management |

### Request Flow Summary

```
Client Request
    │
    ▼
Rate Limiter (anti-abuse)
    │
    ▼
Auth Middleware (validate JWT)
    │
    ▼
Validation Middleware (validate input)
    │
    ▼
Controller (business logic)
    │
    ▼
Service (data processing)
    │
    ▼
Database (read/write)
    │
    ▼
Response (standard format)
```
