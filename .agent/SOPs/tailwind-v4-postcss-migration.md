# Tailwind CSS v4 PostCSS Migration

## Problem

When installing Tailwind CSS with npm in late 2024/2025, you get Tailwind v4 by default. The v4 release has breaking changes in PostCSS configuration.

### Error Message

```
[postcss] It looks like you're trying to use `tailwindcss` directly as a PostCSS plugin.
The PostCSS plugin has moved to a separate package, so to continue using Tailwind CSS
with PostCSS you'll need to install `@tailwindcss/postcss` and update your PostCSS configuration.
```

### Root Cause

Tailwind v4 moved the PostCSS plugin to a separate package `@tailwindcss/postcss`.

## Solution

### 1. Install the new PostCSS plugin

```bash
npm install @tailwindcss/postcss
```

### 2. Update postcss.config.js

**Before (v3 style - broken in v4):**
```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

**After (v4 style):**
```js
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
```

### 3. Update CSS imports

**Before (v3 style):**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**After (v4 style):**
```css
@import "tailwindcss";
```

### 4. Custom colors/theme (optional)

In v4, custom theme values are defined in CSS using `@theme`:

```css
@import "tailwindcss";

@theme {
  --color-primary: #D4A853;
  --color-navy: #1A2332;
  /* etc */
}
```

The `tailwind.config.js` file is no longer required for basic customization.

## Alternative: Use Tailwind v3

If you need the classic setup, explicitly install v3:

```bash
npm install tailwindcss@3
```

## References

- Tailwind v4 announcement: https://tailwindcss.com/blog/tailwindcss-v4
- Migration guide: https://tailwindcss.com/docs/upgrade-guide
