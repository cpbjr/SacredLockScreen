# UI Design System

# Sacred Lock Screens

**Version:** 1.0
**Date:** November 21, 2025
**Status:** MVP Design

---

## Design Philosophy

**Clean, Uplifting, Sacred**

This design system creates a peaceful, reverent experience that mirrors the spiritual purpose of the application. Inspired by:
- Golden autumn forests bathed in warm sunlight
- Majestic coastal sunsets with soft coral skies
- Sacred cathedral architecture with warm stone tones
- The awe-inspiring view of Earth from space

**Core Principles:**
- **Spacious & Minimal** - Generous whitespace creates breathing room
- **Warm & Inviting** - Earth tones evoke comfort and reverence
- **Accessible** - High contrast, readable typography
- **Focused** - UI stays out of the way; the generated image is the hero

---

## Color Palette

### Design Constraints
- **No purples** - Explicitly excluded
- **No gradients** - Flat colors only
- **Warm, natural tones** - Derived from inspiration imagery

---

### Primary Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Golden Honey** | `#D4A853` | 212, 168, 83 | Primary accent, CTA buttons, highlights |
| **Warm Sand** | `#E8DCC8` | 232, 220, 200 | Secondary backgrounds, subtle accents |

### Neutral Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Deep Navy** | `#1A2332` | 26, 35, 50 | Primary text, dark UI elements |
| **Charcoal** | `#374151` | 55, 65, 81 | Secondary text |
| **Stone Gray** | `#6B7280` | 107, 114, 128 | Muted text, borders, placeholders |
| **Light Stone** | `#D1D5DB` | 209, 213, 219 | Dividers, disabled states |
| **Warm White** | `#FAF9F7` | 250, 249, 247 | Page background |
| **Pure White** | `#FFFFFF` | 255, 255, 255 | Cards, inputs, elevated surfaces |

### Semantic Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Ocean Teal** | `#2A7B8C` | 42, 123, 140 | Links, interactive elements |
| **Ocean Teal Light** | `#E6F3F5` | 230, 243, 245 | Teal tinted backgrounds |
| **Soft Coral** | `#E8A07A` | 232, 160, 122 | Hover states, secondary highlights |
| **Soft Coral Light** | `#FDF4EF` | 253, 244, 239 | Coral tinted backgrounds |
| **Success Green** | `#4A8C5E` | 74, 140, 94 | Success states, confirmations |
| **Success Light** | `#EDF7F0` | 237, 247, 240 | Success backgrounds |
| **Error Red** | `#C45C5C` | 196, 92, 92 | Error states, validation |
| **Error Light** | `#FDF2F2` | 253, 242, 242 | Error backgrounds |

---

### CSS Custom Properties

```css
:root {
  /* Primary */
  --color-primary: #D4A853;
  --color-primary-hover: #C49943;
  --color-secondary: #E8DCC8;

  /* Neutrals */
  --color-text-primary: #1A2332;
  --color-text-secondary: #374151;
  --color-text-muted: #6B7280;
  --color-border: #D1D5DB;
  --color-bg-page: #FAF9F7;
  --color-bg-surface: #FFFFFF;

  /* Semantic */
  --color-link: #2A7B8C;
  --color-link-hover: #1F5A68;
  --color-accent: #E8A07A;
  --color-success: #4A8C5E;
  --color-success-bg: #EDF7F0;
  --color-error: #C45C5C;
  --color-error-bg: #FDF2F2;
}
```

---

### Tailwind CSS Configuration

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#D4A853',
          hover: '#C49943',
        },
        secondary: '#E8DCC8',
        navy: '#1A2332',
        charcoal: '#374151',
        stone: {
          DEFAULT: '#6B7280',
          light: '#D1D5DB',
        },
        surface: '#FFFFFF',
        page: '#FAF9F7',
        teal: {
          DEFAULT: '#2A7B8C',
          hover: '#1F5A68',
          light: '#E6F3F5',
        },
        coral: {
          DEFAULT: '#E8A07A',
          light: '#FDF4EF',
        },
        success: {
          DEFAULT: '#4A8C5E',
          light: '#EDF7F0',
        },
        error: {
          DEFAULT: '#C45C5C',
          light: '#FDF2F2',
        },
      },
    },
  },
}
```

---

## Typography

### Font Family

**Primary Font:** Inter (Google Fonts)
- Clean, modern sans-serif
- Excellent readability at all sizes
- Wide character support

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

:root {
  --font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
```

---

### Type Scale

| Element | Size | Weight | Line Height | Letter Spacing | Usage |
|---------|------|--------|-------------|----------------|-------|
| **Display** | 48px | 600 | 1.1 | -0.02em | Hero headlines (rare) |
| **H1** | 36px | 600 | 1.2 | -0.01em | Page titles |
| **H2** | 28px | 600 | 1.3 | -0.01em | Section headers |
| **H3** | 22px | 500 | 1.4 | 0 | Subsection headers |
| **H4** | 18px | 500 | 1.4 | 0 | Card titles |
| **Body Large** | 18px | 400 | 1.6 | 0 | Lead paragraphs |
| **Body** | 16px | 400 | 1.6 | 0 | Primary body text |
| **Body Small** | 14px | 400 | 1.5 | 0 | Secondary text, labels |
| **Caption** | 12px | 400 | 1.4 | 0.01em | Help text, metadata |
| **Overline** | 12px | 600 | 1.4 | 0.08em | Category labels (uppercase) |

---

### CSS Typography Classes

```css
.text-display {
  font-size: 3rem;      /* 48px */
  font-weight: 600;
  line-height: 1.1;
  letter-spacing: -0.02em;
}

.text-h1 {
  font-size: 2.25rem;   /* 36px */
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: -0.01em;
}

.text-h2 {
  font-size: 1.75rem;   /* 28px */
  font-weight: 600;
  line-height: 1.3;
  letter-spacing: -0.01em;
}

.text-h3 {
  font-size: 1.375rem;  /* 22px */
  font-weight: 500;
  line-height: 1.4;
}

.text-h4 {
  font-size: 1.125rem;  /* 18px */
  font-weight: 500;
  line-height: 1.4;
}

.text-body-lg {
  font-size: 1.125rem;  /* 18px */
  font-weight: 400;
  line-height: 1.6;
}

.text-body {
  font-size: 1rem;      /* 16px */
  font-weight: 400;
  line-height: 1.6;
}

.text-body-sm {
  font-size: 0.875rem;  /* 14px */
  font-weight: 400;
  line-height: 1.5;
}

.text-caption {
  font-size: 0.75rem;   /* 12px */
  font-weight: 400;
  line-height: 1.4;
  letter-spacing: 0.01em;
}

.text-overline {
  font-size: 0.75rem;   /* 12px */
  font-weight: 600;
  line-height: 1.4;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
```

---

## Spacing System

### Base Unit: 8px

| Token | Value | Usage |
|-------|-------|-------|
| `space-0` | 0px | Reset |
| `space-1` | 4px | Tight spacing, inline elements |
| `space-2` | 8px | Default small gap |
| `space-3` | 12px | Compact padding |
| `space-4` | 16px | Standard padding, gaps |
| `space-5` | 20px | Medium padding |
| `space-6` | 24px | Section padding |
| `space-8` | 32px | Large gaps |
| `space-10` | 40px | Section spacing |
| `space-12` | 48px | Page padding |
| `space-16` | 64px | Large section breaks |
| `space-20` | 80px | Hero spacing |
| `space-24` | 96px | Major section breaks |

---

### Common Spacing Patterns

```css
/* Component internal padding */
.card { padding: var(--space-6); }           /* 24px */
.button { padding: var(--space-3) var(--space-5); } /* 12px 20px */
.input { padding: var(--space-3) var(--space-4); }  /* 12px 16px */

/* Section spacing */
.section { margin-bottom: var(--space-16); } /* 64px */
.subsection { margin-bottom: var(--space-8); } /* 32px */

/* Page container */
.container {
  padding-left: var(--space-12);   /* 48px desktop */
  padding-right: var(--space-12);
  max-width: 800px;
  margin: 0 auto;
}
```

---

## Layout

### Page Structure

```
┌─────────────────────────────────────────────────────────┐
│                        HEADER                           │
│  Logo                                       (minimal)   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│                      HERO SECTION                       │
│                                                         │
│            "Create Beautiful Scripture                  │
│               Lock Screens"                             │
│                                                         │
│              [Brief tagline/description]                │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │              STEP 1: ENTER VERSE                │   │
│  │  ┌─────────────────────────────────────────┐    │   │
│  │  │                                         │    │   │
│  │  │   [Verse Text Textarea]                 │    │   │
│  │  │                                         │    │   │
│  │  └─────────────────────────────────────────┘    │   │
│  │  ┌─────────────────────────────────────────┐    │   │
│  │  │   [Reference Input]                     │    │   │
│  │  └─────────────────────────────────────────┘    │   │
│  │  Character count: 45/500                        │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │              STEP 2: CHOOSE BACKGROUND          │   │
│  │                                                 │   │
│  │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐      │   │
│  │  │     │ │     │ │ ✓   │ │     │ │     │      │   │
│  │  │     │ │     │ │     │ │     │ │     │      │   │
│  │  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘      │   │
│  │                                                 │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │              STEP 3: SCREEN SIZE                │   │
│  │  ┌─────────────────────────────────────────┐    │   │
│  │  │  iPhone 12 Pro Max (1284 × 2778)    ▼  │    │   │
│  │  └─────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│             ┌─────────────────────────┐                 │
│             │    ★ GENERATE IMAGE     │                 │
│             └─────────────────────────┘                 │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │              PREVIEW & ADJUST                   │   │
│  │                                                 │   │
│  │  ┌───────────────────────────────────────┐     │   │
│  │  │                                       │     │   │
│  │  │                                       │     │   │
│  │  │         [Generated Image              │     │   │
│  │  │              Preview]                 │     │   │
│  │  │                                       │     │   │
│  │  │                                       │     │   │
│  │  └───────────────────────────────────────┘     │   │
│  │                                                 │   │
│  │  Font Size:  [ - ]  100%  [ + ]                │   │
│  │                                                 │   │
│  │  ┌─────────────────┐  ┌─────────────────┐      │   │
│  │  │   Regenerate    │  │    Download     │      │   │
│  │  └─────────────────┘  └─────────────────┘      │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                        FOOTER                           │
│           © 2025 WhitePine Tech · Privacy              │
└─────────────────────────────────────────────────────────┘
```

---

### Container Widths

| Container | Max Width | Usage |
|-----------|-----------|-------|
| **Narrow** | 600px | Text content, forms |
| **Default** | 800px | Main content area |
| **Wide** | 1024px | Extended layouts |
| **Full** | 100% | Edge-to-edge (backgrounds) |

---

### Responsive Breakpoints

| Name | Min Width | Target |
|------|-----------|--------|
| **Mobile** | 0px | Phones |
| **Tablet** | 640px | Tablets, small laptops |
| **Desktop** | 1024px | Laptops, desktops |
| **Wide** | 1280px | Large screens |

```css
/* Mobile first breakpoints */
@media (min-width: 640px) { /* Tablet */ }
@media (min-width: 1024px) { /* Desktop */ }
@media (min-width: 1280px) { /* Wide */ }
```

---

### Responsive Spacing

| Element | Mobile | Tablet+ | Desktop+ |
|---------|--------|---------|----------|
| Page padding (horizontal) | 24px | 32px | 48px |
| Section gap | 48px | 64px | 80px |
| Card padding | 20px | 24px | 24px |

---

## Components

### Buttons

#### Primary Button (Generate)

```css
.btn-primary {
  background-color: var(--color-primary);
  color: var(--color-text-primary);
  font-weight: 600;
  font-size: 1rem;
  padding: 14px 28px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-primary:hover {
  background-color: var(--color-primary-hover);
}

.btn-primary:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.btn-primary:disabled {
  background-color: var(--color-stone-light);
  color: var(--color-text-muted);
  cursor: not-allowed;
}
```

**States:**
- Default: Golden Honey background, dark text
- Hover: Slightly darker gold
- Focus: 2px outline offset
- Disabled: Light gray, muted text
- Loading: Spinner icon, text changes to "Generating..."

---

#### Secondary Button (Download, Regenerate)

```css
.btn-secondary {
  background-color: transparent;
  color: var(--color-teal);
  font-weight: 500;
  font-size: 1rem;
  padding: 12px 24px;
  border-radius: 8px;
  border: 2px solid var(--color-teal);
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background-color: var(--color-teal-light);
  border-color: var(--color-teal-hover);
  color: var(--color-teal-hover);
}
```

---

#### Icon Button (Font Size +/-)

```css
.btn-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-icon:hover {
  border-color: var(--color-teal);
  color: var(--color-teal);
}

.btn-icon svg {
  width: 20px;
  height: 20px;
}
```

---

### Form Elements

#### Text Input

```css
.input {
  width: 100%;
  padding: 12px 16px;
  font-size: 1rem;
  line-height: 1.5;
  color: var(--color-text-primary);
  background-color: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.input::placeholder {
  color: var(--color-text-muted);
}

.input:focus {
  outline: none;
  border-color: var(--color-teal);
  box-shadow: 0 0 0 3px var(--color-teal-light);
}

.input:disabled {
  background-color: var(--color-page);
  color: var(--color-text-muted);
  cursor: not-allowed;
}

.input-error {
  border-color: var(--color-error);
}

.input-error:focus {
  box-shadow: 0 0 0 3px var(--color-error-light);
}
```

---

#### Textarea (Verse Input)

```css
.textarea {
  /* Inherits .input styles */
  min-height: 120px;
  resize: vertical;
  font-family: var(--font-family);
}
```

---

#### Select/Dropdown

```css
.select {
  /* Inherits .input styles */
  appearance: none;
  background-image: url("data:image/svg+xml,..."); /* Chevron icon */
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
  padding-right: 40px;
  cursor: pointer;
}
```

---

#### Form Label

```css
.label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  margin-bottom: 8px;
}
```

---

#### Help Text / Character Counter

```css
.help-text {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  margin-top: 6px;
}

.character-counter {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  text-align: right;
  margin-top: 6px;
}

.character-counter.warning {
  color: var(--color-accent);
}

.character-counter.error {
  color: var(--color-error);
}
```

---

### Cards

#### Section Card

```css
.card {
  background-color: var(--color-bg-surface);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.card-title {
  font-size: 1.125rem;
  font-weight: 500;
  color: var(--color-text-primary);
  margin-bottom: 16px;
}
```

---

#### Background Thumbnail Card

```css
.thumbnail-card {
  position: relative;
  aspect-ratio: 9 / 16;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s ease;
}

.thumbnail-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnail-card:hover {
  border-color: var(--color-stone-light);
  transform: scale(1.02);
}

.thumbnail-card.selected {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px var(--color-primary);
}

.thumbnail-card.selected::after {
  content: '✓';
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  background-color: var(--color-primary);
  color: var(--color-text-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
}
```

---

#### Background Thumbnail Grid

```css
.thumbnail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 12px;
}

@media (min-width: 640px) {
  .thumbnail-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 16px;
  }
}
```

---

### Preview Component

```css
.preview-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  background-color: var(--color-page);
  border-radius: 12px;
}

.preview-image {
  max-width: 100%;
  max-height: 500px;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.preview-controls {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 20px;
}

.font-size-display {
  font-size: 1rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  min-width: 50px;
  text-align: center;
}
```

---

### Feedback Components

#### Loading Spinner

```css
.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid var(--color-stone-light);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-overlay {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 48px;
}

.loading-text {
  font-size: 1rem;
  color: var(--color-text-secondary);
}
```

---

#### Error Message

```css
.error-message {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background-color: var(--color-error-light);
  border: 1px solid var(--color-error);
  border-radius: 8px;
  color: var(--color-error);
  font-size: 0.875rem;
}

.error-message svg {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
}
```

---

#### Success Toast

```css
.toast-success {
  position: fixed;
  bottom: 24px;
  right: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background-color: var(--color-success);
  color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  font-size: 0.875rem;
  font-weight: 500;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
```

---

### Header

```css
.header {
  padding: 24px 0;
  border-bottom: 1px solid var(--color-border);
}

.header-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 48px;
}

.logo {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-primary);
  text-decoration: none;
}

.logo-icon {
  display: inline-block;
  margin-right: 8px;
}
```

---

### Footer

```css
.footer {
  padding: 32px 0;
  margin-top: 64px;
  border-top: 1px solid var(--color-border);
  text-align: center;
}

.footer-text {
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.footer-link {
  color: var(--color-teal);
  text-decoration: none;
}

.footer-link:hover {
  text-decoration: underline;
}
```

---

## Iconography

### Icon Style
- **Style:** Outline/stroke icons
- **Stroke width:** 1.5px - 2px
- **Size:** 20px (default), 16px (small), 24px (large)
- **Source:** Lucide Icons or Heroicons (outline)

### Required Icons

| Icon | Usage |
|------|-------|
| Plus | Font size increase |
| Minus | Font size decrease |
| Download | Download button |
| RefreshCw | Regenerate button |
| Check | Selection indicator |
| AlertCircle | Error indicator |
| CheckCircle | Success indicator |
| Loader | Loading spinner |
| ChevronDown | Dropdown indicator |

---

## Shadows & Elevation

### Shadow Scale

```css
:root {
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 2px 8px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 4px 16px rgba(0, 0, 0, 0.12);
  --shadow-xl: 0 8px 32px rgba(0, 0, 0, 0.16);
}
```

| Level | Shadow | Usage |
|-------|--------|-------|
| **Subtle** | `shadow-sm` | Cards at rest |
| **Medium** | `shadow-md` | Dropdowns, popovers |
| **Large** | `shadow-lg` | Modal overlays |
| **Extra Large** | `shadow-xl` | Preview image |

---

## Border Radius

```css
:root {
  --radius-sm: 4px;   /* Small elements */
  --radius-md: 8px;   /* Buttons, inputs */
  --radius-lg: 12px;  /* Cards */
  --radius-xl: 16px;  /* Large containers */
  --radius-full: 9999px; /* Pills, circles */
}
```

---

## Transitions

```css
:root {
  --transition-fast: 0.15s ease;
  --transition-normal: 0.2s ease;
  --transition-slow: 0.3s ease;
}
```

| Duration | Usage |
|----------|-------|
| **Fast** (150ms) | Hover states, button presses |
| **Normal** (200ms) | Focus states, color changes |
| **Slow** (300ms) | Layout changes, modals |

---

## Accessibility

### Focus States
- All interactive elements have visible focus indicators
- Focus ring: 2px outline with 2px offset
- Color: Ocean Teal for consistency

### Color Contrast
- All text meets WCAG AA standards (4.5:1 for body, 3:1 for large text)
- Primary button text on golden background: 4.8:1 ratio

### Touch Targets
- Minimum touch target: 44px × 44px
- Adequate spacing between interactive elements

### Screen Reader Support
- Semantic HTML structure
- ARIA labels for icon-only buttons
- Status announcements for loading/success/error

---

## Component States Summary

### Interactive Element States

| State | Visual Treatment |
|-------|------------------|
| **Default** | Base styles |
| **Hover** | Subtle color shift, cursor pointer |
| **Focus** | Teal outline ring |
| **Active/Pressed** | Slight darkening |
| **Disabled** | Reduced opacity, gray colors, not-allowed cursor |
| **Selected** | Primary color border/background |
| **Loading** | Spinner, disabled interaction |
| **Error** | Red border, error message |
| **Success** | Green accent, toast notification |

---

## Implementation Notes

### React/Tailwind Setup

```bash
# Required packages
npm install @fontsource/inter lucide-react
```

### Font Loading

```jsx
// In _app.tsx or layout.tsx
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
```

### Component Library Recommendation
Consider using **Radix UI primitives** + custom styling for:
- Accessible by default
- Unstyled (full control)
- Composable patterns

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-11-21 | Initial design system |

---

**END OF DOCUMENT**
