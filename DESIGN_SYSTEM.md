# MotionForge AI — Design System & Color Theme

> **Reference this document for every UI component, page, and feature you build in MotionForge AI.**

---

## Brand Identity

| Property       | Value                                      |
|----------------|--------------------------------------------|
| App Name       | **MotionForge AI**                         |
| Tagline        | *Forge Motion. Craft Vision.*              |
| Mode           | Dark-first (light mode optional)           |
| Personality    | Creative, futuristic, professional, bold   |

---

## Color Palette

All colors are defined as CSS custom properties in `oklch()` for perceptual uniformity.

### Core Brand Colors

| Token                     | OKLCH Value                    | Preview / Usage                              |
|---------------------------|--------------------------------|----------------------------------------------|
| `--brand-primary`         | `oklch(0.65 0.22 285)`         | Vivid indigo-violet — primary CTA, accent     |
| `--brand-primary-hover`   | `oklch(0.58 0.24 285)`         | Darker primary for hover states               |
| `--brand-secondary`       | `oklch(0.72 0.20 200)`         | Electric cyan — secondary accents             |
| `--brand-accent`          | `oklch(0.75 0.25 330)`         | Magenta-pink — highlights, tags, gradients    |
| `--brand-glow-primary`    | `oklch(0.65 0.22 285 / 0.25)` | Glow shadow for primary elements              |
| `--brand-glow-secondary`  | `oklch(0.72 0.20 200 / 0.20)` | Glow shadow for secondary elements            |

### Surface & Background

| Token                  | OKLCH Value               | Usage                                        |
|------------------------|---------------------------|----------------------------------------------|
| `--surface-base`       | `oklch(0.09 0.012 285)`   | Deepest background (page bg)                  |
| `--surface-elevated`   | `oklch(0.13 0.014 285)`   | Cards, modals, header                         |
| `--surface-overlay`    | `oklch(0.17 0.016 285)`   | Dropdown menus, tooltips, hover states        |
| `--surface-border`     | `oklch(1 0 0 / 0.08)`     | Subtle borders on dark surfaces               |
| `--surface-border-glow`| `oklch(0.65 0.22 285 / 0.35)` | Glowing border for active/focused elements|

### Text

| Token                  | OKLCH Value               | Usage                                        |
|------------------------|---------------------------|----------------------------------------------|
| `--text-primary`       | `oklch(0.96 0.005 285)`   | Headings, primary labels                      |
| `--text-secondary`     | `oklch(0.70 0.012 285)`   | Body text, descriptions                       |
| `--text-muted`         | `oklch(0.50 0.010 285)`   | Placeholder text, disabled labels             |
| `--text-inverse`       | `oklch(0.10 0.010 285)`   | Text on light/primary backgrounds             |

### Semantic Colors

| Token              | OKLCH Value                    | Usage                 |
|--------------------|--------------------------------|-----------------------|
| `--color-success`  | `oklch(0.72 0.18 155)`         | Success states        |
| `--color-warning`  | `oklch(0.80 0.18 80)`          | Warning states        |
| `--color-error`    | `oklch(0.65 0.22 25)`          | Error/destructive     |
| `--color-info`     | `oklch(0.70 0.18 225)`         | Informational states  |

### Gradient Definitions

```css
/* Hero gradient — applied on hero section background */
--gradient-hero: radial-gradient(
  ellipse 80% 60% at 50% -10%,
  oklch(0.65 0.22 285 / 0.18) 0%,
  transparent 70%
);

/* Brand gradient — for text, buttons, and highlights */
--gradient-brand: linear-gradient(
  135deg,
  oklch(0.65 0.22 285) 0%,
  oklch(0.72 0.20 200) 50%,
  oklch(0.75 0.25 330) 100%
);

/* Card shimmer — for project cards hover */
--gradient-card-shimmer: linear-gradient(
  135deg,
  oklch(0.65 0.22 285 / 0.08) 0%,
  oklch(0.72 0.20 200 / 0.04) 100%
);

/* Glass surface */
--gradient-glass: linear-gradient(
  135deg,
  oklch(1 0 0 / 0.06) 0%,
  oklch(1 0 0 / 0.02) 100%
);
```

---

## Typography

### Font Stack

```css
/* Import in layout/globals */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap');

--font-sans: 'Inter', system-ui, sans-serif;
--font-display: 'Space Grotesk', system-ui, sans-serif;
--font-mono: 'Geist Mono', 'Fira Code', monospace;
```

### Type Scale

| Role              | Font              | Size            | Weight | Line Height |
|-------------------|-------------------|-----------------|--------|-------------|
| Display / H1      | Space Grotesk     | `clamp(2.5rem, 6vw, 5rem)` | 700 | 1.05 |
| Headline / H2     | Space Grotesk     | `clamp(1.75rem, 3.5vw, 3rem)` | 600 | 1.15 |
| H3                | Space Grotesk     | `1.5rem`        | 600    | 1.25        |
| Body Large        | Inter             | `1.125rem`      | 400    | 1.7         |
| Body              | Inter             | `1rem`          | 400    | 1.6         |
| Body Small        | Inter             | `0.875rem`      | 400    | 1.5         |
| Caption / Label   | Inter             | `0.75rem`       | 500    | 1.4         |
| Code              | Geist Mono        | `0.875rem`      | 400    | 1.5         |

---

## Spacing System

Based on a 4px base unit. Common tokens:

| Token  | Value   | Usage                       |
|--------|---------|-----------------------------|
| `xs`   | `4px`   | Icon gap, tight spacing      |
| `sm`   | `8px`   | Inner padding small          |
| `md`   | `16px`  | Component padding            |
| `lg`   | `24px`  | Section padding              |
| `xl`   | `32px`  | Card padding, gaps           |
| `2xl`  | `48px`  | Hero padding, sections       |
| `3xl`  | `64px`  | Section separators           |
| `4xl`  | `96px`  | Hero top padding             |
| `5xl`  | `128px` | Page-level padding           |

---

## Border Radius

| Token       | Value          | Usage                               |
|-------------|----------------|-------------------------------------|
| `--radius`  | `0.75rem`      | Base radius (12px)                   |
| `sm`        | `0.5rem`       | Badges, small tags                   |
| `md`        | `0.625rem`     | Inputs, buttons                      |
| `lg`        | `0.75rem`      | Cards, panels                        |
| `xl`        | `1rem`         | Modals, drawers                      |
| `2xl`       | `1.5rem`       | Hero prompt box                      |
| `full`      | `9999px`       | Pills, avatar, toggle               |

---

## Component Guidelines

### Header / Navbar
- **Height**: `64px`
- **Background**: `oklch(0.09 0.012 285 / 0.80)` with `backdrop-blur-xl`
- **Border bottom**: `1px solid oklch(1 0 0 / 0.08)`
- **Sticky**: `position: sticky; top: 0; z-index: 50`
- Logo: Gradient icon + bold `Space Grotesk` wordmark
- Nav links: `Inter 500`, subtle underline on hover with brand color
- CTA button: `gradient-brand` background, `border-radius: full`

### Hero Section
- **Padding**: `pt-28 pb-20` on desktop, `pt-20 pb-16` on mobile
- **Heading**: Gradient text using `--gradient-brand` with `background-clip: text`
- **Subtitle**: `--text-secondary`, max-width `640px`, centered
- **Prompt Box**:
  - Background: `--surface-elevated` + glass effect
  - Border: `1px solid --surface-border`
  - On focus: border becomes `--surface-border-glow` + glow shadow
  - Radius: `1.25rem` (`rounded-[1.25rem]`)
  - Send button: `gradient-brand`, `border-radius: full`, right-aligned inside the box

### Prompt Textarea
- Min-height: `80px` (auto-expand)
- Font: `Inter 400`, `16px`
- Color: `--text-primary`
- Placeholder: `--text-muted`
- No border (handled by `InputGroup` wrapper)
- Resize: `none`

### Duration Dropdown
- Style: `Select` component from shadcn
- Width: `fit-content`, min `120px`
- Background: `--surface-overlay`
- Icon: Clock icon inline-start
- Variants: `5 sec`, `10 sec`, `15 sec`, `20 sec`

### Aspect Ratio Tabs
- Style: `Tabs` with variant `default` (pill style)
- Options: `16:9`, `9:16`
- Background: `--surface-overlay`
- Active: `gradient-brand` background

### Project Cards (Gallery)
- **Background**: `--surface-elevated`
- **Border**: `1px solid --surface-border`
- **Hover**: border → `--surface-border-glow`, card lifts (`translate-y-[-4px]`), shimmer overlay
- **Aspect ratio**: `16:9` (landscape) or `9:16` based on video type
- **Radius**: `1rem`
- **Footer**: Username avatar + name, duration badge, aspect ratio badge

---

## Animation Tokens

```css
--transition-fast:    150ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-normal:  250ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-slow:    400ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-spring:  500ms cubic-bezier(0.34, 1.56, 0.64, 1);
```

### Key Micro-animations
- **Hover lift**: `translateY(-4px) + box-shadow increase`
- **Glow pulse**: Subtle box-shadow animation on the prompt area when focused
- **Gradient shimmer**: Moving gradient on card hover
- **Button press**: `scale(0.97)` on active
- **Nav underline**: Width transition from 0 → 100%
- **Fade in up**: Page sections use `opacity 0→1 + translateY(20px→0)` on mount

---

## Glassmorphism Recipe

```css
.glass {
  background: linear-gradient(135deg, oklch(1 0 0 / 0.06), oklch(1 0 0 / 0.02));
  backdrop-filter: blur(12px) saturate(1.4);
  -webkit-backdrop-filter: blur(12px) saturate(1.4);
  border: 1px solid oklch(1 0 0 / 0.08);
}
```

---

## Shadcn/ui Token Mapping

The following overrides go into `globals.css` `:root` / `.dark` blocks to make shadcn components match the MotionForge theme:

```css
/* Dark mode (default for app) */
--background:          oklch(0.09 0.012 285);
--foreground:          oklch(0.96 0.005 285);
--card:                oklch(0.13 0.014 285);
--card-foreground:     oklch(0.96 0.005 285);
--popover:             oklch(0.17 0.016 285);
--popover-foreground:  oklch(0.96 0.005 285);
--primary:             oklch(0.65 0.22 285);
--primary-foreground:  oklch(0.98 0.002 285);
--secondary:           oklch(0.17 0.016 285);
--secondary-foreground:oklch(0.96 0.005 285);
--muted:               oklch(0.17 0.016 285);
--muted-foreground:    oklch(0.55 0.010 285);
--accent:              oklch(0.20 0.018 285);
--accent-foreground:   oklch(0.96 0.005 285);
--destructive:         oklch(0.65 0.22 25);
--border:              oklch(1 0 0 / 0.08);
--input:               oklch(1 0 0 / 0.10);
--ring:                oklch(0.65 0.22 285);
--radius:              0.75rem;
```

---

## Accessibility Guidelines

- Minimum contrast ratio: **4.5:1** for body text, **3:1** for large text
- Focus states: Always visible, use `--ring` (brand indigo glow)
- Interactive elements: Minimum touch target `44x44px`
- Motion: Respect `prefers-reduced-motion` — disable slide/fade animations
- Icons: Always paired with accessible label or `aria-label`

---

## Usage Notes

1. **Always use CSS variables** from this system — no hardcoded hex or rgb values.
2. **Dark mode is the default** — light mode support is optional/future.
3. **Import `Space Grotesk`** for all headings and `Inter` for body text.
4. **Use `oklch()` for all new color definitions** — never convert to hex.
5. **Gradients for primary CTAs** — plain colors for secondary actions.
6. **Glassmorphism** for header, modals, and the prompt box.
7. **Glow effects** should be subtle — only on focused/hovered interactive elements.
