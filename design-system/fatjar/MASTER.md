# Design System Master File — FatJar

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** FatJar — The Piggy Bank for Bitcoin
**Generated:** 2026-03-10
**Category:** Fintech / Crypto / Social Savings
**Aesthetic:** Editorial Brutalist (Direction A — approved Session 5)

---

## Style Direction

**Style:** Editorial Brutalist — warm, confident, magazine-like. NOT the typical dark crypto look.

**Keywords:** editorial, magazine layout, warm brutalism, typographic hierarchy, monospace labels, generous whitespace, accordion patterns, asymmetric grid

**Tone:** Crypto-credible first, friendly second. Professional enough for DeFi users, approachable enough for family savings.

**Differentiation:** No crypto project looks like this. While every DeFi site uses dark mode + gradients + Orbitron, FatJar uses a warm cream editorial layout that feels like a Bloomberg terminal designed by a magazine art director.

**Key Effects:**
- Subtle float animation on hero illustration (5s ease-in-out)
- Accordion expand/collapse with smooth transitions
- Monospace uppercase labels as section markers
- Horizontal rules as section dividers
- Orange accent used sparingly — only for emphasis and CTAs

---

## Color Palette

| Role | Hex | CSS Variable | Usage |
|------|-----|--------------|-------|
| Background | `#F5F2ED` | `--bg` | Page background |
| Background Alt | `#EDEAE4` | `--bg-alt` | Cards, alternate sections |
| Text Primary | `#111111` | `--text` | Headlines, body text |
| Text Secondary | `#555555` | `--text-sec` | Descriptions, secondary info |
| Text Muted | `#999999` | `--text-muted` | Labels, captions, metadata |
| Accent (BTC Orange) | `#F7931A` | `--accent` | CTAs, highlights, token references |
| Accent Dim | `rgba(247,147,26,0.1)` | `--accent-dim` | Hover states, tags, badges |
| Border | `#111111` | `--border` | Primary borders, dividers |
| Border Light | `#D5D0C8` | `--border-light` | Subtle dividers, nav border |

**Color Notes:**
- Orange is the ONLY accent color — no purple, no blue, no green
- Cream background is warm (#F5F2ED), not white (#FFF) and not gray
- High contrast: black text on cream = excellent readability
- Orange used for BTC references, CTAs, and emphasis only

---

## Typography

| Role | Font Family | Weight | Usage |
|------|-------------|--------|-------|
| Display | Syne | 700-800 | Hero headlines, section headers |
| Monospace Labels | IBM Plex Mono | 400-600 | Labels, tags, metadata, nav |
| Body | Source Sans 3 | 300-600 | Paragraphs, descriptions |
| Italic Accent | Newsreader | 400i | Taglines, editorial quotes |

**Google Fonts Import:**
```css
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&family=Source+Sans+3:wght@300;400;500;600&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400&display=swap');
```

**Typography Rules:**
- Hero headlines: Syne 800, clamp(40px, 5.5vw, 76px)
- Section headers: Syne 700, clamp(28px, 3.5vw, 48px)
- Labels: IBM Plex Mono 500, 11px, uppercase, letter-spacing 0.1em
- Body: Source Sans 3 400, 17px, line-height 1.6
- Italic accents: Newsreader italic, used for taglines only
- Max line length: 540px for body text

---

## Spacing

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | `4px` | Tight gaps |
| `--space-sm` | `8px` | Icon gaps, inline spacing |
| `--space-md` | `16px` | Standard padding |
| `--space-lg` | `24px` | Card padding, component gaps |
| `--space-xl` | `32px` | Section inner padding |
| `--space-2xl` | `48px` | Section margins |
| `--space-3xl` | `64px` | Hero padding, major sections |

**Page Layout:**
- Max content width: 1400px
- Side padding: clamp(24px, 4vw, 64px)
- Nav height: 60px (fixed top)

---

## Component Specs

### Buttons

```css
/* Primary CTA — black fill */
.btn-primary {
  background: #111111;
  color: #F5F2ED;
  padding: 16px 32px;
  border: none;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  cursor: pointer;
  transition: background 200ms ease;
}
.btn-primary:hover { background: #333; }

/* Secondary — outlined */
.btn-secondary {
  background: transparent;
  color: #111111;
  padding: 16px 32px;
  border: 1.5px solid #111111;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 13px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  cursor: pointer;
  transition: all 200ms ease;
}
.btn-secondary:hover { background: #111; color: #F5F2ED; }
```

### Cards / Stat Blocks

```css
.stat {
  padding: 24px 0;
  border-top: 2px solid #111;
}
.stat-label {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #999;
}
.stat-value {
  font-family: 'Syne', sans-serif;
  font-size: clamp(28px, 3vw, 40px);
  font-weight: 700;
}
```

### Inputs

```css
.input {
  padding: 14px 16px;
  border: 1.5px solid #D5D0C8;
  background: #F5F2ED;
  font-family: 'Source Sans 3', sans-serif;
  font-size: 16px;
  transition: border-color 200ms ease;
}
.input:focus {
  border-color: #111;
  outline: none;
  box-shadow: 0 0 0 3px rgba(17,17,17,0.05);
}
```

### Accordion (Features)

```css
.accordion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  border-bottom: 1px solid #D5D0C8;
  cursor: pointer;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
```

---

## Page Pattern

**Pattern:** Editorial Landing — conversion-optimized with editorial personality

**Section Order:**
1. Nav (fixed, minimal)
2. Hero (two-column: text + illustration)
3. Stats strip (4 KPIs)
4. Features (accordion, two-column)
5. How It Works (3-step cards)
6. Bonding Curve (visual explainer)
7. Footer (minimal editorial)

---

## Z-Index Scale

| Level | Value | Usage |
|-------|-------|-------|
| Base | `0` | Default content |
| Cards | `10` | Elevated cards |
| Sticky | `20` | Sticky elements |
| Nav | `50` | Fixed navigation |
| Overlay | `100` | Modals, drawers |
| Toast | `200` | Notifications |

---

## Anti-Patterns (Do NOT Use)

- **Dark mode** — We are editorial/warm, not OLED dark
- **Purple gradients** — Orange is our only accent
- **Orbitron / Space Grotesk / Inter** — We use Syne + IBM Plex Mono
- **Neon glows / glassmorphism** — We use sharp lines and flat colors
- **Emojis as icons** — Use Lucide React icons
- **Missing cursor:pointer** — All clickable elements must have cursor:pointer
- **Layout-shifting hovers** — No scale transforms that shift layout
- **Low contrast text** — Maintain 4.5:1 minimum contrast ratio
- **Instant state changes** — Always use transitions (150-300ms)
- **Round corners everywhere** — Use sharp corners or minimal radius (2-4px)

---

## Pre-Delivery Checklist

- [ ] No emojis used as icons (use Lucide React SVG icons)
- [ ] All icons from consistent set (Lucide)
- [ ] `cursor-pointer` on all clickable elements
- [ ] Hover states with smooth transitions (150-300ms)
- [ ] Text contrast 4.5:1 minimum (black on cream = passes)
- [ ] Focus states visible for keyboard navigation
- [ ] `prefers-reduced-motion` respected
- [ ] Responsive: 375px, 768px, 1024px, 1440px
- [ ] No content hidden behind fixed navbar (60px offset)
- [ ] No horizontal scroll on mobile
- [ ] Orange used sparingly (CTAs, highlights only)
- [ ] Monospace labels are uppercase with letter-spacing
- [ ] Syne used ONLY for headlines, never body text
