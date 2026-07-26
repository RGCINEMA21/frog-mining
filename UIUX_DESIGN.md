# 🐸 Frog Mining — UI/UX Design System

---

## 1. Visual Identity

### Style Keywords

- **Fantasy** — elemen alam, kristal, cahaya magis
- **Casual** — ramah, tidak mengintimidasi, cocok semua umur
- **Mining** — tekstur batu, kristal berkilau, emas
- **Cartoon** — bentuk bulat, warna cerah, proporsi playful
- **Premium Mobile Game** — polish tinggi, animasi halus, konsisten

### Visual Mood

Bayangkan pemain masuk ke **rawa ajaib yang hangat dan cerah** — bukan rawa yang gelap dan menakutkan. Cahaya kuning keemasan menembus dedaunan, kristal berkilau di dalam air, dan seekor katak besar tersenyum ramah di tengah layar.

### Quality Reference

| Game | Ambil dari sana | Jangan tiru |
|------|----------------|-------------|
| Brawl Stars | Kesan playful, warna vibrant, UI bersih | Karakter dan tema kompetitif |
| Clash Royale | Card design, ikon tajam, layout terstruktur | Mekanisme kartu dan deck |
| Archero | Sentuhan sederhana, satu karakter fokus | gameplay shooting |
| Royal Match | Kesan cerah, ramah, mobile-first | Match-3 mechanics |

---

## 2. Color System

### Primary Palette

| Role | Color Name | Hex | Kegunaan |
|------|-----------|-----|----------|
| **Swamp Green** | Hijau Rawa | `#2D6A4F` | Background utama, header |
| **Moss Green** | Hijau Lumut | `#52B788` | Aksen utama, tombol aktif |
| **Mud Brown** | Coklat Lumpur | `#8B6914` | Elemen kayu, border |
| **Amber Gold** | Emas Tua | `#D4A017` | Emas, skor tinggi, reward |
| **Crystal Blue** | Biru Kristal | `#48BFE3` | Diamond, efek kilau |
| **Warm White** | Putih Hangat | `#FFF8F0` | Teks utama, background card |
| **Soft Cream** | Krem Lembut | `#FFF3CD` | Background alternatif |

### Secondary Palette

| Role | Color Name | Hex | Kegunaan |
|------|-----------|-----|----------|
| **Deep Swamp** | Hijau Gelap | `#1B4332` | Shadow, kedalaman |
| **Leaf Green** | Hijau Daun | `#74C69D` | Status aktif, success |
| **Crystal Violet** | Ungu Kristal | `#7B68EE` | Efek magis, premium |
| **Ruby Red** | Merah Ruby | `#E63946` | Error, notifikasi penting |
| **Sunset Orange** | Oranye Senja | `#F4845F` | Promo, badge baru |

### Gradient

| Nama | Dari | Ke | Kegunaan |
|------|------|----|----------|
| **Swamp Gradient** | `#1B4332` | `#2D6A4F` | Background layar utama |
| **Gold Gradient** | `#D4A017` | `#F0C040` | Score display, emas |
| **Crystal Gradient** | `#48BFE3` | `#7B68EE` | Diamond, efek premium |
| **Frog Gradient** | `#52B788` | `#2D6A4F` | Kepala katak |

### Warna yang Dihindari

- Hitam pekat (`#000000`) — terlalu gelap
- Merah terang (`#FF0000`) — terlalu agresif
- Putih murni (`#FFFFFF`) — terlalu silau
- Neon warna-warni — tidak cocok tema alam

---

## 3. Typography

### Font Family

```
Primary:    'Nunito', 'Poppins', sans-serif
Display:    'Baloo 2', 'Fredoka One', sans-serif
```

> Nunito = bulat, ramah, cocok untuk UI
> Baloo 2 = playful, cocok untuk score dan judul besar

### Type Scale

| Role | Size | Weight | Kegunaan |
|------|------|--------|----------|
| **Display** | 48–64px | Bold (700) | Score utama (angka besar) |
| **Heading 1** | 28–32px | Bold (700) | Judul layar, nama katak |
| **Heading 2** | 20–24px | SemiBold (600) | Sub-judul, item leaderboard |
| **Body** | 16px | Regular (400) | Teks deskripsi, isi mail |
| **Caption** | 12–14px | Regular (400) | Label, waktu, info kecil |
| **Badge** | 10–12px | Bold (700) | Nomor badge, notifikasi |

### Text Colors

| Context | Color | Hex |
|---------|-------|-----|
| Teks utama di dark bg | Warm White | `#FFF8F0` |
| Teks utama di light bg | Deep Swamp | `#1B4332` |
| Teks sekunder | Soft Cream | `#FFF3CD` dengan 70% opacity |
| Teks disabled | Warm White | `#FFF8F0` dengan 40% opacity |
| Score display | Amber Gold gradient | `#D4A017` → `#F0C040` |
| Diamond display | Crystal Blue | `#48BFE3` |

---

## 4. Layout System

### Screen Structure

```
┌─────────────────────────────────┐
│          HEADER (fixed)         │
│   ┌───────────────────────┐     │
│   │  💎 150    🏆 #12     │     │
│   │  Diamond    Rank       │     │
│   └───────────────────────┘     │
├─────────────────────────────────┤
│                                 │
│         SCORE DISPLAY           │
│        ┌──────────┐             │
│        │  12,450  │  ← Largest │
│        │  SCORE   │    element │
│        └──────────┘             │
│                                 │
│         ┌─────────────┐         │
│         │             │         │
│         │    🐸       │  ← Frog│
│         │   KEPALA    │    Head │
│         │    KATAK    │  (tap)  │
│         │             │         │
│         └─────────────┘         │
│                                 │
│    ┌─────────────────────┐      │
│    │  Auto Mining: 45s   │      │
│    │  ████████████░░░░░  │      │
│    └─────────────────────┘      │
│                                 │
├─────────────────────────────────┤
│       BOTTOM NAV (fixed)        │
│  🛒    🏆    📬    👤    ⚙️    │
│ Shop  Board  Mail  Prof  Set   │
└─────────────────────────────────┘
```

### Layout Zones

| Zone | Position | Content | Behavior |
|------|----------|---------|----------|
| **Header** | Top, fixed | Diamond count, Rank | Always visible, minimal height |
| **Score Display** | Upper center | Score number | Largest text on screen, always visible |
| **Frog Area** | Center | Kepala katak | Main interaction zone, tap target |
| **Status Bar** | Below frog | Auto Mining timer | Shows when active, hides when inactive |
| **Bottom Nav** | Bottom, fixed | 5 menu icons | Always visible, navigation |

### Spacing System (Mobile First)

| Token | Value | Kegunaan |
|-------|-------|----------|
| `xs` | 4px | Gap kecil antar elemen |
| `sm` | 8px | Padding internal komponen |
| `md` | 16px | Jarak antar section |
| `lg` | 24px | Jarak antar blok besar |
| `xl` | 32px | Jarak dari edge layar |

### Safe Areas

- **Notch iPhone**: padding-top 44–47px
- **Home indicator**: padding-bottom 34px
- **Telegram Mini App**: tambah padding untuk Telegram header

---

## 5. Component Specifications

### 5.1 Score Display

```
┌─────────────────────┐
│                     │
│      12,450         │  ← Font: Display, 48–64px
│      SCORE          │  ← Font: Caption, 12px, uppercase
│                     │
└─────────────────────┘

Style:
- Background: Gold Gradient (semi-transparent)
- Border: 2px solid Amber Gold
- Border Radius: 16px
- Shadow: 0 4px 12px rgba(212, 160, 23, 0.3)
- Text Shadow: 0 2px 4px rgba(0,0,0,0.3)
- Padding: 16px 32px
```

### 5.2 Diamond Counter

```
┌──────────────────┐
│  💎  150         │  ← Icon + number, compact
└──────────────────┘

Style:
- Background: Crystal Gradient (semi-transparent)
- Border: 1px solid Crystal Blue
- Border Radius: 20px (pill shape)
- Font: Body, 16px, SemiBold
- Text Color: Crystal Blue
```

### 5.3 Frog Head (Main Interaction)

```
         ┌───────────────┐
         │    ╭─────╮    │
         │   ╱ ◉   ◉ ╲   │  ← Eyes (bulat, besar)
         │  │    ◡    │  │  ← Mouth (smile)
         │   ╲       ╱   │
         │    ╰─────╯    │  ← Body (bulat, besar)
         └───────────────┘

Size: 
- Width: 200–240px (50–60% screen width)
- Height: 200–240px

Style:
- Shape: Bulat (circle/rounded)
- Background: Frog Gradient
- Border: 3px solid Deep Swamp
- Shadow: 0 8px 24px rgba(27, 67, 50, 0.5)
- Cursor: pointer (di desktop)
- Touch: ada feedback saat ditekan

Idle Animation:
- Subtle bounce (translateY 0 → -4px → 0)
- Duration: 2s
- Loop: infinite
- Easing: ease-in-out

Tap Animation:
1. Scale: 1.0 → 0.92 → 1.08 → 1.0 (bounce)
2. Duration: 300ms
3. Easing: cubic-bezier(0.34, 1.56, 0.64, 1)

Glow Effect:
- Box-shadow pulse saat tap
- Color: Amber Gold with 40% opacity
- Duration: 200ms
```

### 5.4 Floating +1 Text

```
     +1
      ↑ (muncul di atas frog, lalu naik dan fade)

Animation:
1. Start: opacity 0, translateY 0
2. Mid: opacity 1, translateY -30px (scale 1.2)
3. End: opacity 0, translateY -60px (scale 0.8)
4. Duration: 800ms
5. Easing: ease-out

Style:
- Font: Display, 24px, Bold
- Color: Amber Gold
- Text Shadow: 0 2px 4px rgba(0,0,0,0.5)
- Position: random X offset ±20px dari center frog
```

### 5.5 Bottom Navigation

```
┌─────┬─────┬─────┬─────┬─────┐
│  🛒 │  🏆 │  📬 │  👤 │  ⚙️ │
│ Shop│Board│Mail │Prof │ Set │
└─────┴─────┴─────┴─────┴─────┘

Style:
- Background: Deep Swamp (#1B4332)
- Height: 60px + safe area
- Border Top: 1px solid Swamp Green
- Items: 5 equal columns

Each Item:
- Icon: 24px
- Label: 10px, Regular
- Color (inactive): Warm White 50% opacity
- Color (active): Moss Green + slight glow
- Active indicator: dot atau underline

Tap Feedback:
- Scale: 0.9 for 100ms
- Color change to active
```

### 5.6 Auto Mining Status Bar

```
┌───────────────────────────────┐
│  ⛏️ Auto Mining    45s left   │
│  ████████████████░░░░░░░░░░░  │
└───────────────────────────────┘

Style:
- Background: Deep Swamp (semi-transparent)
- Border: 1px solid Swamp Green
- Border Radius: 8px
- Progress bar: Moss Green fill
- Text: Warm White, 12px
- Visible only when active
- Hidden when inactive
```

### 5.7 Bottom Sheet / Modal

```
┌─────────────────────────────┐
│         ─── (handle)        │
│                             │
│         MODAL TITLE         │
│                             │
│         Content area        │
│                             │
│    [ Action Button ]        │
│                             │
└─────────────────────────────┘

Style:
- Background: Warm White (#FFF8F0)
- Border Radius: 24px (top corners)
- Shadow: 0 -8px 32px rgba(0,0,0,0.3)
- Handle: 40px × 4px, Mud Brown, centered
- Max Height: 80vh
```

### 5.8 Button

```
┌─────────────────────┐
│     ACTION TEXT      │
└─────────────────────┘

Primary:
- Background: Moss Green (#52B788)
- Text: White, SemiBold, 16px
- Border Radius: 12px
- Padding: 12px 24px
- Shadow: 0 4px 12px rgba(82, 183, 136, 0.4)

Secondary:
- Background: transparent
- Border: 2px solid Moss Green
- Text: Moss Green

Gold (for premium):
- Background: Gold Gradient
- Text: Deep Swamp, Bold
```

### 5.9 Toast / Notification

```
┌─────────────────────────────┐
│  ✅  +10 Diamond received!  │
└─────────────────────────────┘

Style:
- Position: Top center, below header
- Background: Leaf Green (#74C69D)
- Text: White, 14px
- Border Radius: 8px
- Padding: 12px 16px
- Animation: slide down → hold 2s → slide up
- Max 1 visible at a time
```

---

## 6. Animation System

### Principles

1. **Semua animasi harus ringan** — tidak menambah lag
2. **Durasi pendek** — 100ms–500ms untuk sebagian besar
3. **Easing natural** — gunakan cubic-bezier, bukan linear
4. **Tidak berlebihan** — animasi menambah kejelasan, bukan mengganggu

### Easing Curves

| Nama | Value | Kegunaan |
|------|-------|----------|
| **Bounce** | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Frog tap, button press |
| **Smooth** | `cubic-bezier(0.4, 0, 0.2, 1)` | Screen transitions |
| **Snappy** | `cubic-bezier(0, 0.7, 0.3, 1)` | Menu open/close |
| **Ease Out** | `cubic-bezier(0, 0, 0.2, 1)` | Floating text, fade out |

### Animation Catalog

| Nama | Trigger | Property | Duration | Detail |
|------|---------|----------|----------|--------|
| **Frog Bounce** | Tap | scale, translateY | 300ms | 0.92 → 1.08 → 1.0 |
| **Frog Glow** | Tap | box-shadow | 200ms | Gold glow pulse |
| **Frog Idle** | Auto | translateY | 2s loop | -4px float |
| **Floating +1** | Tap | opacity, translateY, scale | 800ms | Up + fade |
| **Score Pulse** | Score change | scale | 200ms | 1.0 → 1.1 → 1.0 |
| **Diamond Sparkle** | Diamond change | opacity, scale | 400ms | Star particles |
| **Screen Slide** | Nav change | translateX | 250ms | Left/right slide |
| **Modal Open** | Menu tap | translateY, opacity | 300ms | Slide up + fade |
| **Modal Close** | Backdrop tap | translateY, opacity | 200ms | Slide down + fade |
| **Toast In** | Notification | translateY, opacity | 250ms | Slide from top |
| **Toast Out** | Auto after 2s | translateY, opacity | 250ms | Slide to top |
| **Rank Change** | Leaderboard | translateY, opacity | 400ms | Swap positions |
| **Button Press** | Tap | scale | 100ms | 1.0 → 0.95 → 1.0 |
| **Progress Fill** | Auto Mining | width | 1s | Smooth bar fill |

### Performance Rules

- Gunakan `transform` dan `opacity` saja (GPU accelerated)
- Hindari animasi `width`, `height`, `top`, `left` (trigger layout)
- Gunakan `will-change: transform` untuk elemen yang sering dianimasi
- Batasi animasi simultan maksimal 3–4 elemen
- Matikan animasi di device low-end (deteksi via `prefers-reduced-motion`)

---

## 7. Responsive Design

### Breakpoints

| Name | Width | Target |
|------|-------|--------|
| **Small Mobile** | 320–374px | iPhone SE, small Android |
| **Mobile** | 375–428px | iPhone 14, Galaxy S series |
| **Large Mobile** | 429–480px | iPhone Plus, Pixel |
| **Tablet** | 481–768px | iPads (minimal support) |

> Fokus utama: **375–428px** (paling banyak dipakai)

### Adaptation Rules

| Element | Small Mobile | Mobile | Large Mobile |
|---------|-------------|--------|-------------|
| Frog Size | 160px | 200px | 240px |
| Score Font | 40px | 48px | 64px |
| Bottom Nav Height | 56px | 60px | 64px |
| Edge Padding | 12px | 16px | 20px |
| Score Padding | 12px 24px | 16px 32px | 20px 40px |

### Telegram Mini App Considerations

- Telegram header = ~56px (Android) / ~44px (iOS)
- Telegram bottom bar = ~48px
- Total safe area: ~100px vertical terpakai
- Game harus fit dalam sisa viewport
- Gunakan `env(safe-area-inset-*)` untuk notch
- Viewport height: gunakan `100dvh` bukan `100vh`

### Orientation

- **Portrait only** — game dirancang untuk portrait
- Jika landscape dipaksa: tampilkan pesan "Put your phone vertically"

---

## 8. UX Flow

### First Time User Experience (FTUE)

```
Open Game
    │
    ▼
┌─────────────────────┐
│  🐸                 │  ← Frog langsung terlihat
│  KEPALA KATAK       │    Tidak ada welcome screen
│  tersenyum          │    Tidak ada tutorial
│                     │    Score = 0
│  (tap me!)          │    Frog bergerak-gerak (idle anim)
└─────────────────────┘
    │
    ▼ (pemain tap)
┌─────────────────────┐
│  1                  │  ← Score muncul (+1)
│  🐸 (bounce)        │    Frog memantul
│  ✨ +1 floating     │    Floating text muncul
└─────────────────────┘
    │
    ▼ (pemain terus tap)
    Pemain sudah paham cara bermain
    Target: < 5 detik
```

### Key UX Principles

1. **Zero instruction needed** — pemain langsung tap tanpa belajar
2. **Immediate feedback** — setiap tap ada respons visual + angka
3. **Score always visible** — motivasi utama, tidak perlu cari
4. **Diamond = goal** — pemain tahu diamond = sesuatu yang berharga
5. **No friction** — tidak ada popup, tidak ada tutorial, tidak ada loading

### Navigation Flow

```
Home Screen (frogs + score)
    │
    ├── 🛒 Shop ──── Beli Diamond ──── Purchase ──── Back
    │
    ├── 🏆 Leaderboard ──── Lihat Ranking ──── Back
    │
    ├── 📬 Mail ──── Claim Reward ──── Back
    │
    ├── 👤 Profile ──── Lihat Stats ──── Back
    │
    └── ⚙️ Settings ──── Sound, Music, About ──── Back
```

### Interaction Patterns

| Action | Pattern |
|--------|---------|
| Tap Frog | Direct touch, immediate response |
| Navigate | Bottom nav tap → screen transition |
| Open Modal | Tap trigger → slide up from bottom |
| Close Modal | Tap backdrop or swipe down |
| Scroll | Native scroll (leaderboard, mail list) |
| Pull to refresh | Not implemented (keep simple) |

---

## 9. Sound Design Direction

### Sound Effects

| Event | Sound | Character |
|-------|-------|-----------|
| Tap Frog | Short "boing" / "ribbit pop" | Playful, satisfying |
| Score +1 | Soft "ding" | Positive feedback |
| Diamond earned | Crystal "chime" | Premium, rewarding |
| Auto Mining tick | Subtle "tick" | Rhythmic, unobtrusive |
| Button tap | Soft "click" | Clean feedback |
| Modal open | "Swoosh" | Smooth transition |
| Level up / Achievement | Fanfare | Celebratory |

### Music

- **Style**: Calm, ambient, nature-inspired
- **Mood**: Peaceful rawa with subtle crystal chimes
- **Tempo**: Slow-medium (80–100 BPM)
- **Volume**: Low default, togglable in settings
- **Loop**: Seamless ambient loop

---

## 10. Accessibility

### Must Have

- Tap target minimum 44×44px
- Sufficient color contrast (WCAG AA)
- Text readable without zoom
- Animations respect `prefers-reduced-motion`
- Score always readable (not only color)

### Nice to Have

- Haptic feedback on tap (if supported)
- Screen reader labels for major elements
- High contrast mode option

---

## 11. Design Token Summary

```
Colors:
  swamp-green:     #2D6A4F
  moss-green:      #52B788
  mud-brown:       #8B6914
  amber-gold:      #D4A017
  crystal-blue:    #48BFE3
  warm-white:      #FFF8F0
  soft-cream:      #FFF3CD
  deep-swamp:      #1B4332
  leaf-green:      #74C69D
  crystal-violet:  #7B68EE
  ruby-red:        #E63946
  sunset-orange:   #F4845F

Typography:
  font-family:     'Nunito', sans-serif
  font-display:    'Baloo 2', sans-serif

Spacing:
  xs: 4px, sm: 8px, md: 16px, lg: 24px, xl: 32px

Border Radius:
  sm: 8px, md: 12px, lg: 16px, xl: 24px, full: 9999px

Animation:
  bounce:  cubic-bezier(0.34, 1.56, 0.64, 1)
  smooth:  cubic-bezier(0.4, 0, 0.2, 1)
  snappy:  cubic-bezier(0, 0.7, 0.3, 1)

Frog Size:
  small: 160px, default: 200px, large: 240px
