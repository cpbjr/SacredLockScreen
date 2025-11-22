# Sacred Lock Screens - Project Documentation

## Overview
Web application for creating beautiful, readable Bible verse lock screen images with guaranteed text accuracy.

## Documentation Index

### System/
- `tech-stack.md` - Technology decisions (React + Express, Satori, Sharp, Claude Haiku)
- `UI-DESIGN-SYSTEM.md` - Complete design system (colors, typography, components)

### Tasks/
- `active.md` - Current implementation tasks
- `planned.md` - Future enhancements

### SOPs/
- `tailwind-v4-postcss-migration.md` - How to fix Tailwind v4 PostCSS plugin errors

## Quick Reference

**Stack:** React + Express, Satori + resvg-js, Sharp, Claude Haiku API
**Ports:** Frontend (5173), Backend (3001)
**Run:** `npm run dev` (starts both servers)

## Key Files
- `/server/index.js` - Express API with image generation
- `/client/` - React frontend with Vite
- `/public/backgrounds/` - Curated background images
- `/PRD.md` - Product requirements
