# Plan: Hybrid Intelligence Typography
**Goal**: Fix the "awful" font quality and strict layout enforcement by switching from *Generative SVG Code* to *AI-Driven Typography*.
## USER COMMENT
USE GEMINI 3 PRO!!! LET IT WORK. 
DO NOT DO ANYTHING OTHER THAN SELECT GEMINI 3 PRO AS THE LLM. 

## The Problem
-   **Current Approach**: Asking a Text LLM (Gemini 1.5 Pro) to write raw SVG code for custom letters.
-   **Result**: "Blobby", unreadable, or ugly text. The model struggles with vector geometry.
-   **User Expectation**: "Beautiful, Inspirational" quality (like Imagen 3 / DALL-E 3 output).

## The Solution: Hybrid Intelligence
Instead of asking the AI to *draw* the letters, we ask the AI to *design* the typography.

### 1. AI Design Agent (`server/ai-service.js`)
We will replace `generateAIFont` with `generateTypographySpecs`. The AI will analyze the Verse + Background and return a **Design JSON**:
-   **Font Family**: AI selects the best match from our curated list (e.g., "Great Vibes" for elegance, "Cinzel" for strength).
-   **Color Palette**: AI picks the Text Color and Shadow Color to match the background.
-   **Layout**: AI determines line breaks, font size, and exact Y-position (strictly enforcing the 25% safe zone).

### 2. High-Fidelity Rendering (`server/index.js`)
We will use the existing `satori` engine to render the text using the **AI's Design Specs**.
-   **Result**: Crisp, professional, high-resolution text.
-   **Constraint**: The 25% top/bottom padding will be mathematically enforced by the renderer, not just "suggested" to the AI.

## Implementation Steps

### Step 1: Curate "Pro" Fonts
Ensure we have a diverse set of high-quality local fonts loaded in `server/index.js`:
-   *Elegant*: Great Vibes, Pinyon Script
-   *Modern*: Inter, Montserrat
-   *Classic*: Cinzel, Playfair Display
-   *Handwritten*: Caveat, Dancing Script

### Step 2: Update AI Service
Modify `server/ai-service.js` to return design parameters instead of SVG code.
```javascript
// New AI Output Structure
{
  "fontFamily": "Great Vibes",
  "textColor": "#F4E4BC", // Warm Gold
  "shadowColor": "#000000",
  "fontSize": 85,
  "lineHeight": 1.4,
  "yPosition": "center", // Enforced logic will handle the math
  "lines": ["The Lord is my shepherd;", "I shall not want."] // AI handles line breaks
}
```

### Step 3: Update Generation Endpoint
Modify `server/index.js` -> `/api/generate` to:
1.  Call `processUserRequest` (Intent).
2.  Call `generateTypographySpecs` (Design).
3.  Render using `satori` with the AI's specs.

## Verification
1.  **Quality**: Text will be perfectly legible and aesthetically pleasing (guaranteed by the font files).
2.  **Layout**: Top/Bottom 25% will be mathematically clear.
3.  **Intelligence**: The "Vibe" will still be AI-generated (e.g., AI choosing "Cinzel" + "Steel Blue" for a verse about Strength).
