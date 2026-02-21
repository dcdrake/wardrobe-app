# Feature Specification: Migrate Frontend from Vue 3 to React

**Feature Branch**: `002-migrate-vue-to-react`
**Created**: 2026-02-14
**Status**: Draft
**Input**: User description: "Migrate the frontend from Vue 3 to React. Keep Django backend and PostgreSQL database unchanged."

## Clarifications

### Session 2026-02-14

- Q: What is the migration strategy for the frontend directory? → A: Parallel build — create React app in a new directory, validate side-by-side, then swap and remove the Vue directory.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Core Authentication Flow (Priority: P1)

A user visits the app and can sign up, log in, and log out exactly as before. The authentication screens, JWT token management, and protected route behavior are identical in the React version. A logged-in user sees their personal navigation; a guest sees the public landing page with sign-up and login options.

**Why this priority**: Authentication gates every other feature. If auth doesn't work, nothing else is testable.

**Independent Test**: Can be fully tested by signing up a new account, logging in, navigating to a protected page, logging out, and confirming redirect to the login screen.

**Acceptance Scenarios**:

1. **Given** a new visitor, **When** they sign up with email and password, **Then** an account is created and they are redirected to the wardrobe view, exactly as in the Vue version.
2. **Given** a registered user, **When** they log in with valid credentials, **Then** they see the authenticated navigation (My Wardrobe, Get Outfits, Logout).
3. **Given** a logged-in user, **When** they log out, **Then** they are redirected to the login screen and cannot access protected routes.
4. **Given** an expired access token, **When** the user makes a request, **Then** the token is silently refreshed and the request succeeds without user intervention.

---

### User Story 2 - Wardrobe Browsing & Item Management (Priority: P1)

A user can view their wardrobe as a visual gallery, filter by item type, tap into an item to see its full details, edit item attributes, and delete items. The visual appearance — card layout, hover effects, color palette — matches the existing editorial magazine aesthetic.

**Why this priority**: The wardrobe is the core data view. If users can't see and manage their items, upload and outfit features have no context.

**Independent Test**: Can be fully tested by logging in with a pre-populated wardrobe, browsing the gallery, filtering by type, viewing item details, editing an attribute, deleting an item, and confirming all changes persist.

**Acceptance Scenarios**:

1. **Given** a user with wardrobe items, **When** they visit the wardrobe page, **Then** they see a responsive grid of clothing cards showing photo, type, colors, and formality.
2. **Given** a wardrobe view, **When** the user selects a type filter, **Then** only items of that type are displayed.
3. **Given** an item detail view, **When** the user edits the item type and saves, **Then** the change persists and the wardrobe gallery reflects the update.
4. **Given** an item detail view, **When** the user deletes the item, **Then** it is removed from the wardrobe and the user is returned to the gallery.

---

### User Story 3 - Single & Batch Photo Upload (Priority: P1)

A user can upload a single clothing photo (with manual or AI-detected attributes) or batch-upload up to 20 photos at once. Batch upload shows real-time per-item progress with status indicators (pending, processing, done, error). The drag-and-drop interaction and Google Photos integration work identically.

**Why this priority**: Upload is the primary data entry path. Batch upload with SSE streaming is the highest-complexity component in the migration.

**Independent Test**: Can be fully tested by uploading a single item, then batch-uploading 5 items via file picker and verifying real-time progress updates, status indicators, and successful addition to the wardrobe.

**Acceptance Scenarios**:

1. **Given** a logged-in user on the add-item page, **When** they upload a photo and submit, **Then** the item is analyzed by AI and added to their wardrobe with detected attributes.
2. **Given** the batch upload page, **When** the user drops 5 image files, **Then** each appears in a preview grid with "pending" status.
3. **Given** a batch upload in progress, **When** items are being processed, **Then** a progress bar advances and each item transitions from pending to processing to done (with type label) or error.
4. **Given** the batch upload page with Google Photos configured, **When** the user clicks "Import from Google Photos," **Then** the Google Picker opens and selected photos are queued for upload with the same progress tracking.
5. **Given** a batch upload in progress, **When** the user clicks cancel, **Then** the upload is aborted and already-processed items are preserved in the wardrobe.

---

### User Story 4 - AI Outfit Suggestions with Streaming (Priority: P1)

A user enters an occasion description and receives 2-4 AI-generated outfit suggestions that stream in progressively. Each suggestion shows item thumbnails from their wardrobe and a conversational explanation. Results are preserved during the browser session when navigating away and back.

**Why this priority**: This is the product's core value proposition. The streaming UX is the second-highest complexity component in the migration.

**Independent Test**: Can be fully tested by populating a wardrobe with 10+ items, requesting outfits for an occasion, watching suggestions stream in, navigating away and back, and confirming results are preserved.

**Acceptance Scenarios**:

1. **Given** a user with wardrobe items, **When** they enter an occasion and submit, **Then** a streaming indicator appears and suggestion text accumulates in real time.
2. **Given** streaming is complete, **When** results are displayed, **Then** each outfit shows item thumbnails (matched to wardrobe photos) and an explanation.
3. **Given** outfit results on screen, **When** the user navigates to another page and returns, **Then** the previous results are still visible (session-scoped persistence).
4. **Given** example occasion prompts, **When** the user clicks one, **Then** it populates the occasion field for convenience.

---

### User Story 5 - Visual & UX Parity (Priority: P2)

The React version MUST be visually indistinguishable from the Vue version. The warm editorial magazine aesthetic — serif typography (Playfair Display), muted earth-tone palette (cream, sand, espresso, terracotta, charcoal), generous whitespace, hover animations, and page transitions — MUST be preserved exactly.

**Why this priority**: UX parity is a non-negotiable quality bar, but it can be validated and polished after functional parity is achieved.

**Independent Test**: Can be tested by placing Vue and React versions side-by-side on the same screen size and confirming visual match across all pages, including hover states and transitions.

**Acceptance Scenarios**:

1. **Given** the React home page, **When** compared to the Vue home page, **Then** layout, typography, colors, and spacing are visually identical.
2. **Given** any page in the React version, **When** the user hovers over a clothing card, **Then** the same scale-up effect and shadow appear as in the Vue version.
3. **Given** navigation between pages, **When** a page transition occurs, **Then** the same fade/slide animation plays as in the Vue version.
4. **Given** any screen width from 320px to 1440px, **When** compared to the Vue version at the same width, **Then** the responsive layout matches.

---

### Edge Cases

- What happens to browser-stored JWT tokens during the switch? Tokens stored in localStorage are framework-agnostic. A user logged into the Vue version MUST remain logged in when the React version replaces it, provided localStorage keys are kept identical.
- What happens if a SSE streaming connection drops mid-upload in the React version? The same behavior as Vue: already-processed items are preserved; the user sees an error state and can retry the remaining items.
- What happens to bookmarked URLs? All routes MUST remain at the same paths so existing bookmarks and shared links continue to work.
- What happens to image preview object URLs when the user navigates away from batch upload? Object URLs MUST be revoked to prevent memory leaks, matching the Vue version's behavior.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The React frontend MUST implement every user-facing feature that exists in the current Vue frontend with identical behavior.
- **FR-002**: All route paths MUST remain unchanged (`/`, `/login`, `/signup`, `/wardrobe`, `/wardrobe/add`, `/wardrobe/batch-add`, `/wardrobe/:id`, `/outfits`).
- **FR-003**: JWT authentication MUST use the same localStorage keys (`access_token`, `refresh_token`) so existing sessions survive the migration.
- **FR-004**: The API layer MUST communicate with the same backend endpoints without any backend changes.
- **FR-005**: SSE streaming for batch upload MUST show real-time per-item progress with pending/processing/done/error states.
- **FR-006**: SSE streaming for outfit suggestions MUST accumulate tokens in real time and display progressive results.
- **FR-007**: Google Photos integration MUST load the same Google APIs, use the same OAuth2 flow, and return selected photos for batch upload.
- **FR-008**: The Tailwind CSS configuration (custom colors, fonts, breakpoints) MUST be preserved exactly.
- **FR-009**: Page transitions MUST provide the same fade/slide animation between routes.
- **FR-010**: All form behaviors MUST match: file upload with preview, drag-and-drop, grouped item-type dropdowns, comma-separated color input, and edit/delete flows.
- **FR-011**: The wardrobe filter-by-type dropdown MUST function identically.
- **FR-012**: Protected routes MUST redirect unauthenticated users to `/login`; guest-only routes MUST redirect authenticated users to `/wardrobe`.
- **FR-013**: The batch upload file limit of 20 items MUST be enforced.
- **FR-014**: Object URLs created for image previews MUST be revoked when no longer needed to prevent memory leaks.

### Assumptions

- The Django backend, PostgreSQL database, and all API endpoints remain completely unchanged. This is a frontend-only migration.
- Tailwind CSS, PostCSS, and Autoprefixer are framework-agnostic and will be reused as-is with only the content paths updated.
- Vite will remain the build tool, with only the plugin swapped from Vue to React.
- The HTTP client library will be retained. The API layer logic (interceptors, SSE parsers) is framework-agnostic and needs only minor structural adaptation.
- The Google Photos integration depends on global browser APIs which are framework-agnostic. The conversion from Vue composable to React hook is structural, not behavioral.
- No new features will be added during the migration. This is a pure framework swap.
- The React app will be built in a parallel directory (e.g., `apps/frontend-react/`) alongside the existing Vue app. Both can run simultaneously during development for side-by-side comparison. Once the React version is fully validated, it replaces the Vue directory and the Vue code is removed.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of existing routes produce functionally identical results in React — every user action available in Vue is available in React.
- **SC-002**: A side-by-side visual comparison at 375px (mobile) and 1440px (desktop) widths shows no perceptible layout, color, or typography differences.
- **SC-003**: Batch upload of 10 items completes with real-time progress indicators, matching the Vue version's streaming behavior.
- **SC-004**: Outfit suggestion streaming begins within 5 seconds of submission, with tokens accumulating visibly in real time.
- **SC-005**: JWT token refresh works transparently — a user with an expired access token can make API calls without re-logging in.
- **SC-006**: The Vue frontend directory can be fully removed after migration with zero impact on application functionality.
- **SC-007**: All existing bookmarked URLs and shared links continue to resolve to the correct pages.
