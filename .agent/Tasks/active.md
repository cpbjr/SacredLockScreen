# Active Tasks

## Recently Completed

### Session: Font System Overhaul (2025-11-22)

**Status:** ✅ COMPLETE

**Summary:**
Completely replaced AI-powered font sizing with deterministic algorithm and added multi-font support. Users can now select from 6 curated fonts, adjust sizes with +/- buttons or direct input, and see changes instantly without manual regeneration.

**Key Changes:**
- Removed Claude Haiku API dependency (saves ~200ms per generation + API costs)
- Implemented deterministic font sizing starting at 105px for short verses
- Added font selector with 6 fonts (5 serif, 1 sans): DejaVu Serif/Sans, Liberation Serif, Free Serif, Noto Serif, Noto Serif Display
- Changed from percentage-based to pixel-based font size adjustments
- Auto-regeneration on font/size changes (instant preview updates)
- Added number input for direct font size entry (no spinners)
- Reference text now 68% of verse size (32% smaller)

**Files Modified:**
- `server/index.js` - Removed AI sizing (lines 101-168), added font registry, deterministic calculator, /api/fonts endpoint
- `client/src/App.tsx` - Added font selector, pixel-based sizing, auto-regenerate, fixed Generate button
- `package.json` - Removed @anthropic-ai/sdk dependency
- `.env.example` - Removed ANTHROPIC_API_KEY requirement

**Issues Resolved:**
1. Generate button not working - Fixed `onClick={handleGenerate}` to `onClick={() => handleGenerate()}`
2. Reference text same size as verse - Changed to 0.68 multiplier (32% smaller)
3. Font size spinner arrows - Hidden with CSS: `[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none`

**Completed:** 2025-11-22

---

## Completed - MVP Build (2025-11-21)

### Summary
Successfully built and tested the Sacred Lock Screens MVP.

### Completed Items
- [x] Project structure setup (React + Express)
- [x] Express backend with Satori + resvg-js + Sharp
- [x] Claude Haiku API integration for AI text sizing
- [x] React frontend with Tailwind CSS v4
- [x] All 8 Playwright tests passing

### Issues Resolved
1. **Tailwind v4 PostCSS Migration** - See `SOPs/tailwind-v4-postcss-migration.md`
2. **Playwright port conflicts** - Set `reuseExistingServer: false` in playwright.config.ts

---

## Completed - Font Sizing Improvements (2025-11-21)

### Summary
Enhanced AI-powered font sizing for better readability and fixed UX issues.

### Completed Items
- [x] Fixed regenerate button to auto-update when adjusting font size with +/- buttons
- [x] Fixed circular structure JSON error in regenerate handler
- [x] Improved AI prompt for larger, more readable font sizes
- [x] Implemented adaptive multiplier based on text length (1.5x for short, 1.0x for very long)
- [x] Added robust parsing for AI responses with fallback algorithm
- [x] Fixed text overflow for long verses (400+ chars)
- [x] Font sizes now achieve 80-100px for short verses, 60px for long verses

### Technical Changes
- `client/src/App.tsx:56-106` - Enhanced regenerate logic with override parameter
- `server/index.js:101-158` - Rewrote AI sizing with adaptive multipliers and better prompts
- `server/index.js:214-227` - Added overflow handling to text container

---

## Current Sprint

No active tasks. All improvements complete and tested.

---

## Next Steps (Phase 2)
- [ ] Text color picker
- [ ] Shadow controls
- [ ] Text alignment options
- [ ] Background upload feature

**Last Updated:** 2025-11-22
