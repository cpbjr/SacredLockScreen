# Tech Stack Document

# Sacred Lock Screens

**Version:** 1.0
**Date:** November 21, 2025
**Status:** MVP Planning

---

## Overview

This document defines the technology stack for Sacred Lock Screens, focusing on MVP implementation with clear paths for future expansion. The key technical challenge is **100% accurate text rendering** on images - a problem AI image generators fail at.

---

## Frontend Stack

### Framework
- **React + TypeScript** (or Next.js for SSR benefits)
- Component-based architecture for maintainability

### Styling
- **Tailwind CSS** for rapid UI development
- Responsive design (mobile-first)

### Key UI Components
- Text input form (verse + reference)
- Background thumbnail grid selector
- Device preset dropdown
- Font size adjustment buttons (+/- 5%)
- Image preview modal
- Download button

### State Management
- React hooks (useState, useContext)
- No external state library needed for MVP

---

## Backend Stack

### Runtime
- **Node.js** (v18+ LTS)
- Express.js or Next.js API routes

### Core Dependencies

| Package | Purpose | Version |
|---------|---------|---------|
| `satori` | HTML/CSS → SVG conversion | Latest |
| `@resvg/resvg-js` | SVG → PNG rendering (Rust-powered) | Latest |
| `sharp` | Background image processing | Latest |
| `express` | API server (if not using Next.js) | 4.x |

### API Endpoints

```
POST /api/generate
  - Input: { verse, reference, backgroundId, devicePreset, fontSize }
  - Output: { imageUrl } or PNG stream

GET /api/backgrounds
  - Output: [{ id, thumbnailUrl, category }]

GET /api/device-presets
  - Output: [{ id, name, width, height }]
```

---

## Text Rendering Solution

### Why Satori + resvg-js?

After extensive research comparing node-canvas, Pillow, Sharp, and ImageMagick, **Satori + resvg-js** emerged as the best solution:

| Criteria | Satori + resvg | node-canvas | Pillow |
|----------|----------------|-------------|--------|
| Text accuracy | Excellent (vector paths) | Good (Cairo) | Good (needs 3x scale) |
| Performance | 2x faster | Baseline | Moderate |
| Text wrapping | Built-in (Yoga layout) | Manual algorithm | Manual algorithm |
| Shadows | CSS shadows | Built-in | Manual draw |
| Dependencies | Zero native deps | node-gyp required | System libraries |
| Cross-platform | Yes (WASM fallback) | Platform issues | Yes |

### How It Works

1. **Satori** converts HTML/CSS to SVG
   - Uses Yoga layout engine (same as React Native)
   - Text is "baked" into vector paths
   - Supports Flexbox for centering
   - Automatic text wrapping

2. **resvg-js** renders SVG to PNG
   - Rust-powered, extremely fast
   - High-quality anti-aliasing
   - Zero native dependencies

### Text Rendering Flow

```
┌─────────────────────────────────────────────────────────────┐
│  1. Build HTML/CSS Layout                                   │
│     - Flexbox container (centered H+V)                      │
│     - 10% margin buffer on all sides                        │
│     - Verse text with calculated font size                  │
│     - Reference on new line, smaller font (60-70%)          │
│     - White text, black shadow                              │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  2. Satori: HTML → SVG                                      │
│     - Input: JSX/HTML + fonts (TTF/OTF/WOFF)               │
│     - Output: SVG string with text as paths                 │
│     - Auto text wrapping via Yoga                           │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  3. resvg-js: SVG → PNG                                     │
│     - Input: SVG string                                     │
│     - Output: PNG buffer                                    │
│     - Rust-powered rendering                                │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  4. Sharp: Composite onto Background                        │
│     - Load background image                                 │
│     - Resize/crop to device preset dimensions               │
│     - Apply 20% dark overlay                                │
│     - Composite text PNG on top                             │
│     - Export final PNG                                      │
└─────────────────────────────────────────────────────────────┘
```

### Font Requirements

- **Supported formats:** TTF, OTF, WOFF (NOT WOFF2)
- **Must provide font files explicitly** to Satori
- Store 3-5 curated fonts in `/fonts` directory
- Load as ArrayBuffer for Satori

### Example Satori Usage

```javascript
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

// Load font
const fontData = await fs.readFile('./fonts/Georgia.ttf');

// Generate SVG from HTML/CSS
const svg = await satori(
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    padding: '10%',  // 10% margin buffer
    color: 'white',
    textShadow: '3px 3px 5px black',
  }}>
    <div style={{ fontSize: 48, textAlign: 'center' }}>
      {verseText}
    </div>
    <div style={{ fontSize: 28, marginTop: 20 }}>
      {reference}
    </div>
  </div>,
  {
    width: 1284,
    height: 2778,
    fonts: [{ name: 'Georgia', data: fontData, style: 'normal' }],
  }
);

// Convert SVG to PNG
const resvg = new Resvg(svg);
const pngBuffer = resvg.render().asPng();
```

---

## Database Schema (Supabase)

### Schema Name
`sacred_lockscreen`

### MVP Tables

#### `backgrounds`
```sql
CREATE TABLE sacred_lockscreen.backgrounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  thumbnail_path TEXT,
  category TEXT DEFAULT 'general',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### `device_presets`
```sql
CREATE TABLE sacred_lockscreen.device_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  is_default BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed MVP preset
INSERT INTO sacred_lockscreen.device_presets (name, width, height, is_default, sort_order)
VALUES ('iPhone 12 Pro Max', 1284, 2778, true, 1);
```

### Future Tables (Not MVP)

#### `users` (Phase 4)
```sql
-- Uses Supabase Auth, linked table
CREATE TABLE sacred_lockscreen.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### `favorites` (Phase 4)
```sql
CREATE TABLE sacred_lockscreen.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES sacred_lockscreen.user_profiles(id),
  verse_text TEXT NOT NULL,
  verse_reference TEXT,
  background_id UUID REFERENCES sacred_lockscreen.backgrounds(id),
  device_preset_id UUID REFERENCES sacred_lockscreen.device_presets(id),
  font_size INTEGER,
  image_url TEXT,
  is_public BOOLEAN DEFAULT false,  -- For sharing
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### `shared_favorites` (Phase 4)
```sql
CREATE TABLE sacred_lockscreen.shared_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  favorite_id UUID REFERENCES sacred_lockscreen.favorites(id),
  shared_by UUID REFERENCES sacred_lockscreen.user_profiles(id),
  share_code TEXT UNIQUE,  -- Short shareable link code
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## File Storage

### MVP Approach
- Background images stored in project `/public/backgrounds/`
- Generated images are transient (not stored)
- Direct download to user's device

### Future (Phase 3+)
- **Supabase Storage** for:
  - User-uploaded backgrounds
  - Saved generated images (favorites)
- Bucket: `sacred-lockscreen-images`

---

## Deployment

### Infrastructure
- **Server:** Existing Hetzner VPS (WhitePine Tech)
- **Container:** Docker
- **Reverse Proxy:** Nginx
- **SSL:** Let's Encrypt

### Docker Configuration

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy application
COPY . .

# Build (if using Next.js)
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### Environment Variables

```bash
# Database
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx

# Application
NODE_ENV=production
PORT=3000

# Future
SUPABASE_SERVICE_ROLE_KEY=xxx  # For admin operations
```

---

## Performance Considerations

### MVP Targets
- Page load: < 2 seconds
- Image generation: < 5 seconds
- Concurrent users: 50+

### Optimization Strategies

1. **Font caching** - Load fonts once at startup
2. **Background preprocessing** - Store optimized versions
3. **Streaming response** - Stream PNG directly to client
4. **No server storage** - Generate and serve, don't persist

---

## Future Expansion Path

### Phase 2: Customization
- Add font selection UI
- Color picker integration
- Shadow toggle/controls
- Store user preferences in localStorage

### Phase 3: More Devices & Backgrounds
- Add device presets to database
- Background categories and filtering
- User background uploads → Supabase Storage

### Phase 4: User Accounts
- Supabase Auth integration
- Favorites table
- Share functionality with short codes

### Phase 5: Analytics
- Add `generation_logs` table
- Track popular backgrounds, text lengths
- Rate limiting middleware

---

## Security Considerations

### Input Sanitization
- Strip HTML from verse text
- Escape special characters
- Validate text length (10-500 chars)

### MVP Security
- No user data stored
- No authentication required
- CORS configured for production domain

### Future Security (Phase 4+)
- Supabase RLS policies for user data
- Rate limiting per IP/user
- File upload validation

---

## Development Setup

### Prerequisites
- Node.js 18+
- npm or pnpm
- Supabase project (for backgrounds/presets)

### Quick Start
```bash
# Clone repository
git clone <repo-url>
cd sacred-lockscreens

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with Supabase credentials

# Run development server
npm run dev
```

### Font Setup
Place TTF/OTF/WOFF fonts in `/fonts` directory:
- Georgia.ttf (or similar serif)
- Arial.ttf (or similar sans-serif)
- Additional curated fonts

---

## Document History

| Version | Date       | Changes                              |
|---------|------------|--------------------------------------|
| 1.0     | 2025-11-21 | Initial tech stack document          |

---

**END OF DOCUMENT**
