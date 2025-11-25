# Active Task Roadmap

## Phase 1: Intelligent Pipeline (Current)
- [x] **Server-Side Logic**
    - [x] Implement `processUserRequest` in `ai-service.js` (Gemini Flash).
    - [x] Create `/api/process-input` endpoint in `index.js`.
    - [x] Integrate Intent Detection (Verse, Ref, Topic).
    - [x] Integrate Smart Background Selection (from existing 6 images).
- [ ] **Client-Side Implementation**
    - [x] Refactor UI to Single "Magic Input".
    - [x] **Verify & Refine**: Ensure "Magic Input" works smoothly.
    - [ ] **User Choice**: Ensure user can easily override the AI-selected background.
    - [ ] **Error Handling**: Graceful fallback if AI fails.

## Phase 2: UI/UX Polish
- [ ] **Organic Animations**: Refine `OrganicBackground` and transitions.
- [ ] **Mobile Responsiveness**: Verify layout on mobile devices.

## Phase 3: Verification
- [ ] **End-to-End Testing**: Test Verse, Reference, and Topic flows.
- [ ] **Visual Check**: Verify "Nano Banana Pro" font rendering.
- [ ] **Padding Constraint**: Verify 25% top/bottom clear space is respected.
