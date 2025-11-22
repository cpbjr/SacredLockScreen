# Sacred Lock Screens - Claude Code Instructions

## Project Overview
Bible verse lock screen generator using React + Express with AI-powered text sizing.

## Tech Stack
- **Frontend:** React + TypeScript + Vite + Tailwind CSS
- **Backend:** Express + Satori + resvg-js + Sharp
- **AI:** Claude Haiku for optimal font sizing
- **No Database:** MVP uses filesystem for backgrounds, hardcoded presets

## Development Commands
```bash
npm run dev          # Start both frontend and backend
npm run server       # Backend only (port 3001)
npm run client       # Frontend only (port 5173)
npm test             # Run Playwright tests
```

## API Endpoints
- `GET /api/backgrounds` - List available backgrounds
- `GET /api/device-presets` - List device presets
- `POST /api/generate` - Generate lock screen image

## Key Directories
- `/server/` - Express backend
- `/client/` - React frontend
- `/public/backgrounds/` - Background images
- `/public/fonts/` - Font files (optional, uses system fonts)

## Environment Variables
- `ANTHROPIC_API_KEY` - Claude API key (has default for development)

## Testing
Playwright tests in `/tests/` directory. Run with `npm test`.
