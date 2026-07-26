# 🐸 Frog Mining — Design System & Asset Guideline

> **Dokumen ini menjadi pedoman resmi seluruh aset dan komponen visual Frog Mining.**
> Semua elemen visual harus mengikuti standar ini agar konsisten.

---

## 1. Visual Identity

### Game Identity

```
Name:       Frog Mining
Genre:      Casual / Idle Clicker / Fantasy / Mining
Style:      Cartoon / Friendly / Premium Mobile / Colorful / Clean
Mood:       Rawa ajaib yang hangat, cerah, penuh kristal berkilau
Feeling:    Menyenangkan, memuaskan, adiktif (tap → score → reward)
```

### Visual Pillars

| Pillar | Description |
|--------|-------------|
| **Friendly** | Semua elemen bulat, ramah, tidak mengintimidasi |
| **Colorful** | Warna vibrant tapi tidak norak |
| **Clean** | UI bersih, tidak cluttered, fokus pada frog |
| **Premium** | Polished, smooth animations, consistent spacing |
| **Playful** | Bounce, glow, floating — semua terasa hidup |

---

## 2. Color Palette

### Design Tokens

```css
:root {
  /* ═══════════════════════════════════════════════
     PRIMARY COLORS
     ═══════════════════════════════════════════════ */

  /* Swamp Green — Background utama, header */
  --color-primary:           #2D6A4F;
  --color-primary-light:     #52B788;
  --color-primary-dark:      #1B4332;

  /* Moss Green — Aksen utama, tombol aktif, success */
  --color-secondary:         #52B788;
  --color-secondary-light:   #74C69D;
  --color-secondary-dark:    #40916C;

  /* ═══════════════════════════════════════════════
     ACCENT COLORS
     ═══════════════════════════════════════════════ */

  /* Amber Gold — Score, emas, reward, premium */
  --color-gold:              #D4A017;
  --color-gold-light:        #F0C040;
  --color-gold-dark:         #B8860B;

  /* Crystal Blue — Diamond, kristal, magic */
  --color-crystal:           #48BFE3;
  --color-crystal-light:     #72D6F5;
  --color-crystal-dark:      #3AA8D8;

  /* Crystal Violet — Magic, premium effects */
  --color-violet:            #7B68EE;
  --color-violet-light:      #9B8AFF;

  /* ═══════════════════════════════════════════════
     SEMANTIC COLORS
     ═══════════════════════════════════════════════ */

  /* Success — Positive actions, online, active */
  --color-success:           #74C69D;
  --color-success-dark:      #52B788;

  /* Warning — Attention needed, promo */
  --color-warning:           #F4845F;
  --color-warning-light:     #FF9A76;

  /* Error — Destructive, banned, failed */
  --color-error:             #E63946;
  --color-error-dark:        #C1121F;

  /* ═══════════════════════════════════════════════
     BACKGROUND COLORS
     ═══════════════════════════════════════════════ */

  /* Backgrounds */
  --color-bg-primary:        #1B4332;
  --color-bg-secondary:      #2D6A4F;
  --color-bg-card:           #40916C;
  --color-bg-card-alt:       #52B788;
  --color-bg-surface:        #FFF8F0;
  --color-bg-overlay:        rgba(0, 0, 0, 0.6);

  /* ═══════════════════════════════════════════════
     TEXT COLORS
     ═══════════════════════════════════════════════ */

  --color-text-primary:      #FFF8F0;
  --color-text-secondary:    rgba(255, 248, 240, 0.7);
  --color-text-muted:        rgba(255, 248, 240, 0.4);
  --color-text-dark:         #1B4332;
  --color-text-on-card:      #FFF8F0;
  --color-text-on-button:    #1B4332;

  /* ═══════════════════════════════════════════════
     SHADOW COLORS
     ═══════════════════════════════════════════════ */

  --color-shadow-sm:         rgba(0, 0, 0, 0.2);
  --color-shadow-md:         rgba(0, 0, 0, 0.3);
  --color-shadow-lg:         rgba(0, 0, 0, 0.4);
  --color-shadow-glow-gold:  rgba(212, 160, 23, 0.4);
  --color-shadow-glow-crystal: rgba(72, 191, 227, 0.4);

  /* ═══════════════════════════════════════════════
     GRADIENTS
     ═══════════════════════════════════════════════ */

  --gradient-swamp:          linear-gradient(135deg, #1B4332, #2D6A4F);
  --gradient-gold:           linear-gradient(135deg, #D4A017, #F0C040);
  --gradient-crystal:        linear-gradient(135deg, #48BFE3, #7B68EE);
  --gradient-frog:           linear-gradient(135deg, #52B788, #2D6A4F);
}
```

### Color Usage Rules

| Color | Use For | Never Use For |
|-------|---------|---------------|
| `--color-primary` | Headers, main backgrounds | Text, buttons |
| `--color-secondary` | Active states, success actions | Error states |
| `--color-gold` | Score, premium, rewards | Backgrounds |
| `--color-crystal` | Diamond, magic effects | Error states |
| `--color-success` | Confirmations, online | Warning |
| `--color-warning` | Promo, attention | Error |
| `--color-error` | Destructive actions, bans | Success |
| `--color-text-primary` | Main text on dark bg | Text on light bg |
| `--color-text-dark` | Text on light bg | Text on dark bg |

---

## 3. Typography

### Font Families

```css
:root {
  --font-family-base:      'Nunito', 'Poppins', system-ui, -apple-system, sans-serif;
  --font-family-display:   'Baloo 2', 'Nunito', system-ui, sans-serif;
  --font-family-mono:      'Fira Code', 'Consolas', monospace;
}
```

| Font | Usage | Character |
|------|-------|-----------|
| **Nunito** | Body text, UI elements | Rounded, friendly, readable |
| **Baloo 2** | Display text, scores, titles | Playful, bold, game-like |
| **Fira Code** | Debug info, code display | Monospace, technical |

### Type Scale

| Role | Size | Weight | Line Height | Font | Use For |
|------|------|--------|-------------|------|---------|
| **Display** | 48px | Bold (700) | 1.1 | Baloo 2 | Score display, hero numbers |
| **H1** | 32px | Bold (700) | 1.2 | Baloo 2 | Screen titles |
| **H2** | 24px | SemiBold (600) | 1.3 | Nunito | Section headings |
| **H3** | 20px | SemiBold (600) | 1.3 | Nunito | Card titles, subtitles |
| **Body** | 16px | Regular (400) | 1.5 | Nunito | Main content, descriptions |
| **Body-SM** | 14px | Regular (400) | 1.5 | Nunito | Secondary text |
| **Caption** | 12px | Regular (400) | 1.4 | Nunito | Labels, timestamps |
| **Badge** | 10px | Bold (700) | 1.0 | Nunito | Badge numbers, tiny labels |
| **Button** | 16px | Bold (700) | 1.0 | Nunito | Button text |
| **Button-SM** | 14px | Bold (700) | 1.0 | Nunito | Small button text |

### Typography Tokens

```css
:root {
  --font-size-display:    3rem;    /* 48px */
  --font-size-h1:         2rem;    /* 32px */
  --font-size-h2:         1.5rem;  /* 24px */
  --font-size-h3:         1.25rem; /* 20px */
  --font-size-body:       1rem;    /* 16px */
  --font-size-body-sm:    0.875rem;/* 14px */
  --font-size-caption:    0.75rem; /* 12px */
  --font-size-badge:      0.625rem;/* 10px */

  --font-weight-regular:  400;
  --font-weight-semibold: 600;
  --font-weight-bold:     700;
}
```

---

## 4. Icon Style

### Guidelines

| Rule | Description |
|------|-------------|
| **Shape** | Rounded corners, no sharp edges |
| **Style** | Cartoon/fantasy, colorful, friendly |
| **Size** | Default 24px, small 16px, large 32px |
| **Color** | Use currentColor or specific design tokens |
| **Format** | SVG preferred, PNG fallback |
| **Grid** | 24×24px grid, 2px padding |

### Icon Sizes

```css
:root {
  --icon-size-sm:   16px;
  --icon-size-md:   24px;
  --icon-size-lg:   32px;
  --icon-size-xl:   48px;
}
```

### Icon Categories

| Category | Icons | Style |
|----------|-------|-------|
| **Navigation** | Home, Shop, Board, Mail, Profile, Settings | Filled, colorful |
| **Action** | Tap, Buy, Claim, Close, Back | Bold, clear |
| **Status** | Online, Offline, Active, Inactive | Simple, recognizable |
| **Game** | Frog, Diamond, Score, Crown, Medal | Fantasy, playful |
| **UI** | Arrow, Check, Close, Info, Warning | Minimal, clean |

### Naming Convention

```
icon-[category]-[name]-[size].svg

Examples:
  icon-nav-home.svg
  icon-nav-shop.svg
  icon-game-frog.svg
  icon-game-diamond.svg
  icon-action-close.svg
  icon-status-active.svg
```

---

## 5. Button Style

### Variants

| Variant | Background | Text | Border | Use For |
|---------|-----------|------|--------|---------|
| **Primary** | `--color-secondary` | `--color-text-on-button` | None | Main actions |
| **Secondary** | transparent | `--color-secondary` | 2px solid secondary | Alternative actions |
| **Gold** | `--gradient-gold` | `--color-text-on-button` | None | Premium actions |
| **Danger** | `--color-error` | white | None | Destructive actions |
| **Ghost** | transparent | `--color-text-secondary` | None | Minimal actions |

### Button Sizes

| Size | Height | Padding | Font Size | Border Radius |
|------|--------|---------|-----------|---------------|
| **SM** | 32px | 8px 16px | 14px | 8px |
| **MD** | 40px | 12px 20px | 16px | 12px |
| **LG** | 48px | 16px 24px | 18px | 12px |
| **XL** | 56px | 16px 32px | 20px | 16px |
| **Full** | 48px | 16px 0 | 16px | 12px |

### Button States

| State | Transform | Shadow | Opacity |
|-------|-----------|--------|---------|
| **Default** | none | `--shadow-sm` | 1.0 |
| **Hover** | none | `--shadow-md` | 1.0 |
| **Active** | scale(0.95) | `--shadow-sm` | 1.0 |
| **Disabled** | none | none | 0.5 |
| **Loading** | none | none | 0.7 |

### Button Tokens

```css
:root {
  --btn-height-sm:      32px;
  --btn-height-md:      40px;
  --btn-height-lg:      48px;
  --btn-height-xl:      56px;

  --btn-padding-sm:     8px 16px;
  --btn-padding-md:     12px 20px;
  --btn-padding-lg:     16px 24px;
  --btn-padding-xl:     16px 32px;

  --btn-radius-sm:      8px;
  --btn-radius-md:      12px;
  --btn-radius-lg:      12px;
  --btn-radius-full:    9999px;
}
```

---

## 6. Card Style

### Card Variants

| Variant | Background | Border | Use For |
|---------|-----------|--------|---------|
| **Default** | `--color-bg-card` | none | General cards |
| **Elevated** | `--color-bg-card` | none | Important cards |
| **Outlined** | transparent | 1px solid border | Secondary cards |
| **Highlighted** | `--gradient-gold` | 2px solid gold | Featured items |

### Card Properties

```css
:root {
  --card-radius:        16px;
  --card-padding:       16px;
  --card-gap:           12px;
  --card-shadow:        0 4px 12px rgba(0, 0, 0, 0.2);
  --card-shadow-hover:  0 8px 24px rgba(0, 0, 0, 0.3);
}
```

### Card Structure

```
┌─────────────────────────────┐
│  [Optional: Badge/Label]    │  ← 8px from top
│                             │
│  Content Area               │  ← 16px padding
│                             │
│  [Optional: Actions]        │  ← 12px gap
└─────────────────────────────┘
  Border Radius: 16px
  Shadow: 0 4px 12px
  Padding: 16px
```

---

## 7. Animation Style

### Principles

| Rule | Description |
|------|-------------|
| **Lightweight** | Gunakan transform & opacity saja |
| **Short Duration** | 100ms–500ms untuk sebagian besar |
| **Natural Easing** | cubic-bezier, bukan linear |
| **Purposeful** | Animasi menambah kejelasan, bukan mengganggu |
| **Performant** | Hindari layout-triggering properties |

### Easing Curves

```css
:root {
  --ease-bounce:    cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-smooth:    cubic-bezier(0.4, 0, 0.2, 1);
  --ease-snappy:    cubic-bezier(0, 0.7, 0.3, 1);
  --ease-out:       cubic-bezier(0, 0, 0.2, 1);
  --ease-in:        cubic-bezier(0.4, 0, 1, 1);
}
```

### Animation Catalog

| Animation | Trigger | Properties | Duration | Easing |
|-----------|---------|------------|----------|--------|
| **Tap Bounce** | Tap frog | scale(0.92 → 1.08 → 1) | 300ms | bounce |
| **Frog Idle** | Auto | translateY(0 → -8px → 0) | 2s | ease-in-out |
| **Floating +1** | Tap | opacity, translateY(-60px), scale(0.8) | 800ms | ease-out |
| **Score Pulse** | Score change | scale(1 → 1.1 → 1) | 200ms | bounce |
| **Diamond Sparkle** | Diamond change | opacity, scale | 400ms | smooth |
| **Glow Pulse** | Tap | box-shadow opacity | 200ms | ease-out |
| **Button Press** | Tap | scale(0.95) | 100ms | smooth |
| **Screen Fade** | Navigation | opacity(0 → 1) | 250ms | smooth |
| **Modal Slide** | Open | translateY(100% → 0) | 300ms | smooth |
| **Popup Slide** | Notification | translateY(-20px → 0), opacity | 300ms | smooth |
| **Tab Switch** | Tab tap | background-color | 200ms | smooth |
| **Card Hover** | Hover | box-shadow, translateY(-2px) | 200ms | smooth |

### Animation Tokens

```css
:root {
  --duration-fast:      100ms;
  --duration-normal:    200ms;
  --duration-slow:      300ms;
  --duration-slower:    400ms;
  --duration-slowest:   800ms;
}
```

### Performance Rules

```
✅ DO:
  ├── Gunakan transform (translate, scale, rotate)
  ├── Gunakan opacity
  ├── Gunakan will-change untuk animasi频繁
  └── Batch DOM reads/writes

❌ DON'T:
  ├── Animasi width, height, top, left
  ├── Animasi box-shadow kompleks
  ├── Lebih dari 3 animasi simultan
  └── Animasi di atas konten teks
```

---

## 8. Audio Guideline

### Style

| Character | Description |
|-----------|-------------|
| **Casual** | Ringan, tidak serius |
| **Fantasy** | Sentuhan magis, kristal |
| **Lucu** | Playful, menyenangkan |
| **Satisfying** | Memuaskan setiap tap |

### Audio Categories

| Category | Sound | Duration | Character |
|----------|-------|----------|-----------|
| **Tap** | "Boing" / "Ribbit pop" | 100–200ms | Playful, satisfying |
| **Score +1** | Soft "Ding" | 100ms | Positive feedback |
| **Diamond Earned** | Crystal "Chime" | 200–300ms | Premium, rewarding |
| **Button Tap** | Soft "Click" | 50ms | Clean feedback |
| **Popup** | "Swoosh" | 150ms | Smooth transition |
| **Leaderboard Rank Up** | "Level up" fanfare | 500ms | Celebratory |
| **Mail Received** | "Letter drop" | 200ms | Notification |
| **Auto Mining Tick** | Subtle "Tick" | 50ms | Rhythmic, unobtrusive |
| **Error** | Soft "Bonk" | 150ms | Gentle error |

### Audio Volume

```css
/* Default volumes (togglable in settings) */
SFX Volume:   70%
Music Volume: 30%
```

### Audio File Naming

```
sfx_[category]_[name].wav

Examples:
  sfx_tap_boing.wav
  sfx_score_ding.wav
  sfx_diamond_chime.wav
  sfx_button_click.wav
  sfx_popup_swoosh.wav
  sfx_rank_fanfare.wav
  sfx_mail_drop.wav
  sfx_error_bonk.wav

bgm_[theme].mp3

Examples:
  bgm_main_ambient.mp3
  bgm_menu_calm.mp3
```

---

## 9. Asset Folder Structure

```
public/assets/
│
├── 📁 images/
│   ├── 📁 characters/           # Frog sprites & animations
│   │   ├── frog_idle.png
│   │   ├── frog_tap_01.png
│   │   ├── frog_tap_02.png
│   │   └── frog_happy.png
│   │
│   ├── 📁 backgrounds/          # Screen backgrounds
│   │   ├── bg_home.png
│   │   ├── bg_shop.png
│   │   └── bg_landing.png
│   │
│   ├── 📁 ui/                   # UI elements
│   │   ├── score_bg.png
│   │   ├── diamond_icon.png
│   │   ├── mining_bar_bg.png
│   │   └── card_bg.png
│   │
│   └── 📁 icons/                # Navigation & action icons
│       ├── icon_nav_home.svg
│       ├── icon_nav_shop.svg
│       ├── icon_nav_board.svg
│       ├── icon_nav_mail.svg
│       ├── icon_nav_profile.svg
│       └── icon_nav_settings.svg
│
├── 📁 sounds/
│   ├── sfx_tap_boing.wav
│   ├── sfx_score_ding.wav
│   ├── sfx_diamond_chime.wav
│   ├── sfx_button_click.wav
│   ├── sfx_popup_swoosh.wav
│   ├── sfx_error_bonk.wav
│   └── bgm_main_ambient.mp3
│
├── 📁 fonts/
│   ├── Nunito-Regular.woff2
│   ├── Nunito-SemiBold.woff2
│   ├── Nunito-Bold.woff2
│   ├── Baloo2-SemiBold.woff2
│   └── Baloo2-Bold.woff2
│
└── 📁 animations/               # Lottie/Rive animations (optional)
    ├── frog_idle.json
    ├── frog_tap.json
    └── diamond_sparkle.json
```

---

## 10. Naming Convention

### Files

| Type | Convention | Example |
|------|-----------|---------|
| **Images** | snake_case | `frog_idle.png`, `bg_home.png` |
| **Icons** | kebab-case | `icon-nav-home.svg` |
| **Sounds** | snake_case | `sfx_tap_boing.wav` |
| **Fonts** | PascalCase | `Nunito-Bold.woff2` |
| **Animations** | snake_case | `frog_idle.json` |
| **CSS** | kebab-case | `bottom-nav.css` |
| **JS** | PascalCase (class) | `HomeScreen.js` |
| **JS** (util) | camelCase | `logger.js` |

### CSS Classes

| Type | Convention | Example |
|------|-----------|---------|
| **Block** | BEM block | `.card`, `.btn`, `.nav` |
| **Element** | BEM element | `.card__title`, `.btn__icon` |
| **Modifier** | BEM modifier | `.card--highlighted`, `.btn--primary` |
| **State** | is/was prefix | `.is-active`, `.is-hidden` |

### Bad Examples (Never Use)

```
❌ image1.png
❌ new_icon.svg
❌ test_final2.wav
❌ bg (too short)
❌ screenshot 2025.png
❌ untitled.png
```

---

## 11. Spacing & Layout Tokens

```css
:root {
  /* Spacing Scale */
  --space-2xs:   2px;
  --space-xs:    4px;
  --space-sm:    8px;
  --space-md:    16px;
  --space-lg:    24px;
  --space-xl:    32px;
  --space-2xl:   48px;

  /* Border Radius */
  --radius-sm:   8px;
  --radius-md:   12px;
  --radius-lg:   16px;
  --radius-xl:   24px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-xs:   0 1px 2px rgba(0, 0, 0, 0.1);
  --shadow-sm:   0 2px 4px rgba(0, 0, 0, 0.2);
  --shadow-md:   0 4px 12px rgba(0, 0, 0, 0.3);
  --shadow-lg:   0 8px 24px rgba(0, 0, 0, 0.4);
  --shadow-xl:   0 12px 48px rgba(0, 0, 0, 0.5);

  /* Z-Index */
  --z-base:      1;
  --z-dropdown:  10;
  --z-header:    100;
  --z-nav:       100;
  --z-overlay:   500;
  --z-modal:     1000;
  --z-toast:     1100;
}
```

---

## 12. Responsive Breakpoints

```css
/* Mobile First */
@media (min-width: 320px)  { /* Small Mobile */ }
@media (min-width: 375px)  { /* Mobile (default) */ }
@media (min-width: 428px)  { /* Large Mobile */ }
@media (min-width: 481px)  { /* Tablet (minimal) */ }
```

### Breakpoint Rules

| Element | 320px | 375px | 428px |
|---------|-------|-------|-------|
| Frog Size | 100px | 120px | 140px |
| Score Font | 36px | 42px | 48px |
| Nav Height | 56px | 60px | 64px |
| Card Padding | 12px | 16px | 20px |
| Edge Padding | 12px | 16px | 20px |

---

## 13. Accessibility

| Rule | Requirement |
|------|-------------|
| **Tap Targets** | Minimum 44×44px |
| **Color Contrast** | WCAG AA (4.5:1 for text) |
| **Text Size** | Minimum 12px |
| **Focus States** | Visible focus ring for keyboard |
| **Reduced Motion** | Respect `prefers-reduced-motion` |
| **Alt Text** | All images have descriptive alt |
| **Screen Reader** | Major elements have aria-labels |

---

## 14. Quick Reference Card

```
┌─────────────────────────────────────────────────────┐
│              FROG MINING DESIGN CHEATSHEET          │
├─────────────────────────────────────────────────────┤
│                                                     │
│  COLORS                                             │
│  Primary:    #2D6A4F  Secondary:  #52B788           │
│  Gold:       #D4A017  Crystal:    #48BFE3            │
│  Success:    #74C69D  Error:      #E63946            │
│  Text:       #FFF8F0  Text Dark:  #1B4332            │
│                                                     │
│  FONTS                                              │
│  Body:     Nunito 16px                              │
│  Display:  Baloo 2 48px                             │
│  Caption:  Nunito 12px                              │
│                                                     │
│  SPACING                                            │
│  xs: 4px   sm: 8px   md: 16px   lg: 24px   xl: 32px│
│                                                     │
│  RADIUS                                             │
│  sm: 8px   md: 12px   lg: 16px   xl: 24px          │
│                                                     │
│  ANIMATION                                          │
│  Bounce:  0.34, 1.56, 0.64, 1                      │
│  Smooth:  0.4, 0, 0.2, 1                           │
│  Snappy:  0, 0.7, 0.3, 1                           │
│                                                     │
│  BUTTONS                                            │
│  SM: 32px  MD: 40px  LG: 48px  XL: 56px            │
│                                                     │
└─────────────────────────────────────────────────────┘
```
