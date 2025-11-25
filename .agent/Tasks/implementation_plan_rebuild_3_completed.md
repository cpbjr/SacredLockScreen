# Sacred Lock Screen Redesign Plan

## Goal Description
Redesign the "Sacred Lock Screen" web application to achieve an "Organic, Inspired, and Artistic" aesthetic. The goal is to move away from a traditional "holy/religious" look towards something that feels grounded, creative, and flowing. The interface should feel like a digital art studio or a mindfulness journal.

## User Review Required
> [!IMPORTANT]
> **Design Shift**:
> - **Theme**: "Organic Flow" - utilizing earth tones (Sage, Sand, Terracotta, Charcoal) and natural textures (paper grain, watercolor).
> - **Vibe**: "Inspired" rather than "Sacred". Less gold/ornate, more artistic/hand-crafted.
> - **Copy**: Updating text to be broader and more welcoming (e.g., "Transform words into art").
>
> **Safety & Preview**:
> - **Version Control**: Work is being done on a separate branch `redesign-v1`. The original code is safe on `main`.
> - **Preview**: You can preview changes via `npm run dev` (localhost) or through the screenshots/walkthroughs I provide. No deployment is required.

## Proposed Changes

### Client
#### [MODIFY] [index.css](file:///home/cpbjr/Documents/AI_Automation/Projects/SacredLockScreen/client/src/index.css)
- **Colors**: Replace "Midnight/Gold" with an Earth Tone palette:
    - Primary: Warm Terracotta or Muted Sage.
    - Background: Soft Cream/Paper White (#FDFBF7).
    - Text: Soft Charcoal.
- **Typography**: Switch to modern editorial serifs (e.g., `Lora` or `Playfair Display`) paired with clean sans-serifs.
- **Effects**: Remove heavy "glows". Add subtle shadows, paper textures, and organic border radii.

#### [MODIFY] [App.tsx](file:///home/cpbjr/Documents/AI_Automation/Projects/SacredLockScreen/client/src/App.tsx)
- **Hero Section**:
    - Replace "Sacred Lock Screens" heading with something lighter or just style it differently.
    - Tagline: "Create meaningful wallpapers" instead of "Transform scripture".
    - Visuals: Use organic shapes (blobs, brush strokes) instead of "light rays" and "sparkles".
- **Components**:
    - Replace `GoldenAccent` with `OrganicDivider` (brush stroke style).
    - Replace `FloatingParticles` with `OrganicBackground` (slow moving gradients or shapes).
- **Input/Gallery**: Style containers with softer, more asymmetrical rounded corners (squircles or organic shapes).

#### [NEW] [components/PhoneFrame.tsx](file:///home/cpbjr/Documents/AI_Automation/Projects/SacredLockScreen/client/src/components/PhoneFrame.tsx)
- A new component to wrap the generated image in a realistic phone frame (CSS-only or SVG).

### Rebuild #1: Visual & Format Updates
#### [MODIFY] [client/src/components/OrganicBackground.tsx](file:///home/cpbjr/Documents/AI_Automation/Projects/SacredLockScreen/client/src/components/OrganicBackground.tsx)
- **Design Update**: User requested "fluidity and curves, subtle and light, asymmetric" instead of geometric.
- **Implementation**: Use large, slow-moving SVG paths or blurred shapes with very low opacity to create a subtle, flowing backdrop.

### Rebuild #2: AI Features
#### [NEW] [.env](file:///home/cpbjr/Documents/AI_Automation/Projects/SacredLockScreen/.env)
- Store `OPENROUTER_API_KEY`.

#### [NEW] [server/ai-service.js](file:///home/cpbjr/Documents/AI_Automation/Projects/SacredLockScreen/server/ai-service.js)
- Implement `calculateOptimalLayout` function using OpenRouter (Gemini Flash/Pro via OpenRouter).
- **Prompt Logic**: Input verse text -> Output JSON with `fontSize`, `lineHeight`, `paddingTop`, `paddingBottom` to satisfy "1/4 top, 1/4 bottom" constraint.

#### [MODIFY] [server/index.js](file:///home/cpbjr/Documents/AI_Automation/Projects/SacredLockScreen/server/index.js)
- Integrate `ai-service.js`.
- Update `generateImage` to use AI-calculated values when enabled.

#### [MODIFY] [client/src/App.tsx](file:///home/cpbjr/Documents/AI_Automation/Projects/SacredLockScreen/client/src/App.tsx)
- Add "AI Layout" toggle to the UI.
- Pass `useAI: true` to the generate endpoint.

### Rebuild #3: Nano Banana Pro Font (AI SVG Generation)
#### [MODIFY] [server/ai-service.js](file:///home/cpbjr/Documents/AI_Automation/Projects/SacredLockScreen/server/ai-service.js)
- Implement `generateAIFont(verseText, apiKey)` function.
- Prompt Gemini to act as a "master calligrapher" and return raw SVG code.
- Style: "Nano Banana Pro" - Organic, flowing, hand-drawn, highly artistic.
- Constraints: ViewBox 0 0 1000 1000, black fill/stroke, centered.

#### [MODIFY] [server/index.js](file:///home/cpbjr/Documents/AI_Automation/Projects/SacredLockScreen/server/index.js)
- Import `generateAIFont`.
- In `generateImage`, check for `useProFont` flag.
- If enabled, call `generateAIFont` instead of standard Satori text rendering.
- Composite the returned SVG into the final image using Satori (as an `img` tag or inline SVG).

#### [MODIFY] [client/src/App.tsx](file:///home/cpbjr/Documents/AI_Automation/Projects/SacredLockScreen/client/src/App.tsx)
- Add "Nano Banana Pro Font" toggle under the AI Layout toggle.
- Pass `useProFont` boolean to the backend API.

## Verification Plan
### Automated Tests
- None (Visual feature).

### Manual Verification
- Enable "Nano Banana Pro Font" in UI.
- Generate an image.
- Verify the text is rendered as a custom artistic SVG.
- Verify it respects the 25% padding constraints (AI should handle this, but we'll verify).espects the layout constraints if possible.

## Fix: Enforce 1/4 Top/Bottom Padding
#### [MODIFY] [server/ai-service.js](file:///home/cpbjr/Documents/AI_Automation/Projects/SacredLockScreen/server/ai-service.js)
- Update the system prompt to explicitly demand `paddingTop` and `paddingBottom` be at least 25% (or more).
- Force the AI to prioritize this "blank space" constraint over font size.

#### [MODIFY] [server/index.js](file:///home/cpbjr/Documents/AI_Automation/Projects/SacredLockScreen/server/index.js)
- Ensure the `paddingTop` and `paddingBottom` values from the AI are strictly applied to the container.
- Consider adding a hard fallback or clamp to ensure they never drop below 25%.
