# Product Requirements Document

# Sacred Lock Screens

**Version:** 2.0
**Date:** November 21, 2025
**Project Owner:** Christopher (WhitePine Tech)
**Document Status:** Master Reference

---

## Executive Summary

### Product Vision

Sacred Lock Screens is a web application that creates beautiful, readable Bible verse lock screen images. While AI image generators struggle with accurate text rendering, this tool uses traditional text rendering to guarantee perfect, professional-quality scripture images for mobile devices.

### Problem Statement

Catholic users who want to keep scripture visible on their phone lock screens face significant barriers:

- AI tools produce unreliable, often incorrect text
- Manual design tools require technical skills
- No streamlined solution exists for devotional imagery

### Solution

A simple, beautiful web application where users paste any Bible verse and instantly generate a professionally-formatted lock screen image with guaranteed text accuracy.

### Target Audience

- **Primary:** Individual Catholics seeking daily scripture reminders
- **Secondary:** Parish social media managers, Catholic content creators
- **Tertiary:** Bible study groups, religious educators

---

## Core User Flow (MVP)

### Step 1: Paste Quote
- User enters Bible verse text in textarea
- User enters verse reference (e.g., "John 3:16")
- Validation: 10-500 characters

### Step 2: Choose Background
- User selects from curated background library
- Thumbnail grid display
- Backgrounds uploaded to project by owner
- Backgrounds pre-processed for text readability (subtle darkening overlay)

### Step 3: Choose Screen Size
- Device preset dropdown selector
- **Default:** iPhone 12 Pro Max (1284 × 2778 pixels)

### Step 4: Generate
- **AI Text Sizing Tool:** Analyzes verse length and selects optimal font size
- **AI Reference Separation:** Detects and separates verse reference, renders on new line with smaller font
- **Text Rendering Tool:** Composites text onto background image
- Processing time: < 5 seconds

### Step 5: Edit (if necessary)
- Preview displayed to user
- **Font size adjustment:** +/- buttons in 5% increments
- User can regenerate with different background

### Step 6: Download
- Download final PNG image
- Filename format: `sacred-lockscreen-{timestamp}.png`

---

## MVP Requirements (Phase 1)

### Text Input
- Multi-line textarea for verse text
- Single-line input for verse reference
- Character counter
- Validation: minimum 10 chars, maximum 500 chars
- Sanitize input (strip HTML, escape special characters)
- Preserve user's line breaks

### Background System
- Curated background images (uploaded by project owner)
- User selects from thumbnail grid
- Auto-crop/scale to target resolution
- 20% opacity dark overlay for text readability

### Text Rendering

**Layout Requirements:**
- **10% margin buffer** on all sides (text never touches edges)
- Text centered horizontally AND vertically within safe zone
- Verse reference on separate line at bottom of text block
- Reference rendered in smaller font than verse text

**Typography:**
- Font selected by system from curated group of 3-5 options
- White text (#FFFFFF) with black shadow
- Shadow: 3px offset, 5px blur
- Line height: 1.4
- Intelligent word-wrap (no mid-word breaks)

**AI Text Sizing Tool:**
- Analyzes verse length to select optimal starting font size
- Considers: character count, word count, line break count, target resolution
- Ensures text fits within 10% margin safe zone

**AI Reference Separation:**
- Identifies verse reference from input
- Renders reference on new line below verse text
- Uses smaller font size for reference (e.g., 60-70% of verse font)

**User Font Size Adjustment:**
- +/- buttons to adjust font size
- Each click = 5% size change
- Live preview update

### Device Presets (MVP)
- iPhone 12 Pro Max: 1284 × 2778 pixels (default)

### Output Specifications
- Format: PNG
- Color depth: 24-bit RGB
- File size target: < 3MB

### Session Behavior
- No tracking or analytics
- No user accounts
- One-off generation each time
- No saved history or preferences

### Error Handling
- Text too long: Clear message with character count
- Text too short: Prompt to enter more text
- Generation failure: Friendly retry message

---

## Future Goals

### Phase 2: Customization
- **User font selection:** Choose from available fonts
- **Text color picker:** Preset palette + custom colors
- **Shadow controls:** Enable/disable, adjust offset and blur
- **Text alignment options:** Top, center, bottom positioning

### Phase 3: Device & Backgrounds
- **Additional device presets:**
  - iPhone 15 Pro Max (1290 × 2796)
  - Samsung Galaxy (1440 × 3088)
  - iPad (2048 × 2732)
  - Custom dimensions
- **User background uploads:** Upload own images
- **Background categories:** Nature, Abstract, Liturgical, Seasonal
- **Smart contrast detection:** Auto-select white or black text

### Phase 4: User Accounts & Social
- **User accounts:** Login/registration
- **Save favorites:** Store preferred backgrounds and generated images
- **Share favorites:** Share with other users
- **Catholic Readings API:** "Use Today's Gospel" button

### Phase 5: Analytics & Admin
- **Analytics dashboard:** Usage tracking, popular backgrounds
- **Rate limiting:** Prevent abuse
- **Admin panel:** Upload backgrounds, manage categories

### Phase 6: Advanced Features
- **Batch generation:** Multiple verses, ZIP download
- **Social sharing:** Instagram/Facebook optimized crops
- **Advanced typography:** Gradients, outlines, multiple shadow layers

### Long-Term Vision
- Mobile app (iOS/Android)
- Multilingual support
- Community background submissions
- Premium tier with advanced features

---

## Technical Requirements (Implementation Agnostic)

### Required Tools/Capabilities

1. **AI Text Sizing Tool**
   - Input: Verse text, target resolution, safe zone dimensions
   - Output: Recommended font size
   - Logic: Balance readability with fitting text in safe zone (10% margins)

2. **AI Reference Separation**
   - Input: Verse text and reference
   - Output: Formatted text with reference on new line, smaller font
   - Logic: Identify reference, apply size reduction (60-70%)

3. **Text Rendering Tool**
   - Input: Text, font, size, position, colors, shadow settings
   - Output: Text layer composited on background
   - Must support: Multi-line, word-wrap, shadows, centering within safe zone

4. **Image Processing**
   - Resize/crop backgrounds to target resolution
   - Apply overlay for text readability
   - Export as PNG

### Performance Targets
- Page load: < 2 seconds
- Image generation: < 5 seconds

### Security
- Input sanitization (prevent injection)
- No personal data collection in MVP

---

## Success Metrics

### Primary Goals
1. **Reliability:** 100% text accuracy (no rendering errors)
2. **Simplicity:** 6 steps from landing to download
3. **Beauty:** Professional-quality images worthy of daily use
4. **Speed:** < 5 second generation time

---

## User Stories

### Daily Devotional User
**As a** Catholic seeking daily spiritual reminders
**I want to** quickly create a beautiful Bible verse lock screen
**So that** I see God's word every time I unlock my phone

**Acceptance Criteria:**
- Generate image in < 60 seconds total interaction
- Text is always readable and accurate
- Image looks professional
- Works on mobile devices

---

## Document History

| Version | Date       | Author                | Changes                                           |
|---------|------------|-----------------------|---------------------------------------------------|
| 1.0     | 2025-11-14 | Claude (AI Assistant) | Initial PRD creation                              |
| 2.0     | 2025-11-21 | Claude (AI Assistant) | Technology-agnostic rewrite, refined MVP flow, removed analytics from MVP, added reference separation |

---

**END OF DOCUMENT**
