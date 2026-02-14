# Tasks: Migrate Frontend from Vue 3 to React

**Input**: Design documents from `/specs/002-migrate-vue-to-react/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/component-map.md, quickstart.md

**Tests**: Not requested in spec. Manual validation per quickstart.md checklist.

**Organization**: Tasks are grouped by user story. All user stories are P1 except US5 (P2). The parallel build strategy means all work happens in `apps/frontend-react/`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the `apps/frontend-react/` directory with build tooling, dependencies, and configuration files. No application code yet.

- [x] T001 Create `apps/frontend-react/package.json` with React 18+, react-dom, react-router-dom, zustand, axios dependencies; @vitejs/plugin-react, tailwindcss, postcss, autoprefixer as devDependencies. Run `pnpm install`.
- [x] T002 [P] Create `apps/frontend-react/vite.config.js` — replace `vue()` plugin with `react()` plugin; keep identical proxy config (`/api` → `localhost:8000`, `/media` → `localhost:8000`); set dev server port to 5174.
- [x] T003 [P] Create `apps/frontend-react/tailwind.config.js` — copy from Vue version, update `content` paths from `**/*.vue` to `**/*.{js,jsx}`. Preserve all custom colors (cream, sand, espresso, terracotta, charcoal), fonts (Playfair Display, Inter), and breakpoints exactly.
- [x] T004 [P] Copy `apps/frontend/postcss.config.js` → `apps/frontend-react/postcss.config.js` verbatim.
- [x] T005 [P] Create `apps/frontend-react/index.html` — copy from Vue version, change `src/main.js` to `src/main.jsx`.
- [x] T006 [P] Copy `apps/frontend/src/assets/main.css` → `apps/frontend-react/src/assets/main.css` verbatim (Tailwind directives + custom CSS + Vue transition classes retained for PageTransition).

**Checkpoint**: `pnpm dev` should start without errors and show a blank page on `http://localhost:5174`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: API layer, state management stores, routing shell, and shared components that ALL user stories depend on.

**CRITICAL**: No user story work can begin until this phase is complete.

- [x] T007 Create `apps/frontend-react/src/api/index.js` — adapt the Axios instance + request interceptor (JWT injection) + response interceptor (401 refresh + retry) from `apps/frontend/src/api/index.js`. Copy SSE streaming functions (`batchUpload`, `googlePhotosUpload`, `suggestStream`) verbatim — they use callbacks, not Vue reactivity.
- [x] T008 [P] Create `apps/frontend-react/src/stores/useAuthStore.js` — Zustand store with state: `user` (Object|null), `token` (String|null, initialized from `localStorage.getItem('access_token')`). Derived selector: `isAuthenticated` = `!!token`. Actions: `signup`, `login`, `fetchUser`, `logout`. Must use localStorage keys `access_token` and `refresh_token` (FR-003).
- [x] T009 [P] Create `apps/frontend-react/src/stores/useWardrobeStore.js` — Zustand store with state: `items` (Array), `loading` (Boolean). Derived: `itemCount` = `items.length`. Actions: `fetchItems`, `addItem`, `updateItem`, `deleteItem`, `analyzeItem`, `getItemById`.
- [x] T010 Create `apps/frontend-react/src/components/ProtectedRoute.jsx` — wraps `<Outlet>` with auth check; redirects unauthenticated users to `/login` via `<Navigate>` (FR-012).
- [x] T011 [P] Create `apps/frontend-react/src/components/GuestRoute.jsx` — wraps `<Outlet>` with auth check; redirects authenticated users to `/wardrobe` (FR-012).
- [x] T012 [P] Create `apps/frontend-react/src/components/PageTransition.jsx` — CSS-based route transition wrapper using `useLocation()` key. Reuse existing `.page-enter-active` / `.page-leave-active` CSS keyframes from `main.css` (FR-009).
- [x] T013 Create `apps/frontend-react/src/App.jsx` — functional component with `<BrowserRouter>` wrapping. Inline NavBar with auth-aware navigation (My Wardrobe, Get Outfits, Logout for authenticated; Login, Sign Up for guests). `<PageTransition>` wrapping `<Routes>` with all route definitions. Route structure: `/` → HomePage, `/login` → LoginPage (GuestRoute), `/signup` → SignupPage (GuestRoute), `/wardrobe` → WardrobePage (ProtectedRoute), `/wardrobe/add` → AddItemPage (ProtectedRoute), `/wardrobe/batch-add` → BatchUploadPage (ProtectedRoute), `/wardrobe/:id` → ItemDetailPage (ProtectedRoute), `/outfits` → OutfitsPage (ProtectedRoute).
- [x] T014 Create `apps/frontend-react/src/main.jsx` — `createRoot().render(<App/>)` entry point. Import `main.css`.

**Checkpoint**: App shell loads with navigation. Clicking nav links changes routes (pages show placeholder content). Protected routes redirect to `/login`. Guest routes redirect to `/wardrobe` when a mock token exists in localStorage.

---

## Phase 3: User Story 1 — Core Authentication Flow (Priority: P1)

**Goal**: Users can sign up, log in, log out, and access protected routes identically to the Vue version.

**Independent Test**: Sign up → log in → see authenticated nav → navigate to protected page → log out → confirm redirect to login → confirm protected routes redirect when unauthenticated.

### Implementation

- [x] T015 [P] [US1] Create `apps/frontend-react/src/pages/LoginPage.jsx` — email + password form; `onSubmit` calls `useAuthStore.login()`; redirects to `/wardrobe` on success; shows error message on failure. Match Vue `LoginView.vue` layout and styling exactly.
- [x] T016 [P] [US1] Create `apps/frontend-react/src/pages/SignupPage.jsx` — email + password form; `onSubmit` calls `useAuthStore.signup()`; redirects to `/wardrobe` on success. Match Vue `SignupView.vue` layout and styling exactly.
- [x] T017 [US1] Create `apps/frontend-react/src/pages/HomePage.jsx` — landing page with auth-aware content. Authenticated users see wardrobe item count and links to wardrobe/outfits. Guests see sign-up/login CTAs. Match Vue `HomeView.vue` layout exactly.
- [x] T018 [US1] Wire up NavBar logout button in `App.jsx` — calls `useAuthStore.logout()`, navigates to `/login`.

**Checkpoint**: Full auth flow works. SC-001 (auth routes), SC-005 (token refresh), SC-007 (bookmarked URLs) are validated for auth-related routes.

---

## Phase 4: User Story 2 — Wardrobe Browsing & Item Management (Priority: P1)

**Goal**: Users can view their wardrobe gallery, filter by type, view item details, edit attributes, and delete items.

**Independent Test**: Log in → view wardrobe gallery → filter by type → click item → view details → edit an attribute → save → delete an item → confirm removal.

### Implementation

- [x] T019 [P] [US2] Create `apps/frontend-react/src/components/ClothingCard.jsx` — receives item props; renders photo, type, colors, formality; `<Link>` to `/wardrobe/:id`. Match Vue `ClothingCard.vue` hover effects (scale-up + shadow) exactly.
- [x] T020 [US2] Create `apps/frontend-react/src/pages/WardrobePage.jsx` — `useEffect` fetches items on mount via `useWardrobeStore.fetchItems()`; filter-by-type dropdown (FR-011); responsive grid of `<ClothingCard>` components; `useMemo` for filtered items. Match Vue `WardrobeView.vue` layout exactly.
- [x] T021 [US2] Create `apps/frontend-react/src/pages/ItemDetailPage.jsx` — `useParams().id` to load item; display all attributes; edit toggle via `useState`; save calls `useWardrobeStore.updateItem()`; delete calls `useWardrobeStore.deleteItem()` then navigates to `/wardrobe`. Match Vue `ItemDetailView.vue` layout exactly.

**Checkpoint**: Wardrobe browsing and item management work end-to-end. SC-001 (wardrobe routes), SC-002 (visual parity for cards and gallery) are validated.

---

## Phase 5: User Story 3 — Single & Batch Photo Upload (Priority: P1)

**Goal**: Users can upload a single photo or batch-upload up to 20 photos with real-time SSE progress, drag-and-drop, and Google Photos integration.

**Independent Test**: Upload a single item → verify it appears in wardrobe. Batch upload 5 items → verify per-item progress indicators (pending → processing → done/error). Test drag-and-drop. Test cancel mid-upload.

### Implementation

- [x] T022 [US3] Create `apps/frontend-react/src/pages/AddItemPage.jsx` — file input via `useRef()`; FormData construction; grouped `<optgroup>` rendering for item types via `.map()`; submit calls API. Match Vue `AddItemView.vue` layout exactly.
- [x] T023 [US3] Create `apps/frontend-react/src/pages/BatchUploadPage.jsx` — **HIGH COMPLEXITY**. 5+ `useState` hooks for: files, previews, upload status per item, overall progress, abort controller. Drag-and-drop via native `onDragOver`/`onDrop` handlers. File limit of 20 enforced (FR-013). SSE streaming via `batchUpload()` callback → `useState` updates for per-item status (pending → processing → done/error) (FR-005). Cancel button triggers `AbortController.abort()`. `useEffect` cleanup revokes object URLs (FR-014). Match Vue `BatchUploadView.vue` layout and progress indicators exactly.
- [x] T024 [P] [US3] Create `apps/frontend-react/src/hooks/useGooglePhotos.js` — convert Vue composable (`apps/frontend/src/composables/useGooglePhotos.js`) to React hook. Replace `ref()` → `useState()`, `computed()` → `useMemo()`. Script loading, OAuth2 token flow, and Picker configuration remain identical (FR-007).
- [x] T025 [US3] Integrate Google Photos into BatchUploadPage — "Import from Google Photos" button calls `useGooglePhotos` hook; selected photos are queued for upload with same progress tracking.

**Checkpoint**: Single and batch upload work with real-time streaming progress. SC-003 (batch upload of 10 items with progress) is validated. Google Photos integration works if configured.

---

## Phase 6: User Story 4 — AI Outfit Suggestions with Streaming (Priority: P1)

**Goal**: Users enter an occasion, receive streaming AI suggestions with item thumbnails and explanations, and results persist during the session.

**Independent Test**: With 10+ wardrobe items, request outfits → watch tokens stream in → verify suggestions show thumbnails → navigate away and back → confirm results persist.

### Implementation

- [x] T026 [US4] Create `apps/frontend-react/src/pages/OutfitsPage.jsx` — **HIGH COMPLEXITY**. Occasion input form with example prompts (click to populate). `useState` for streaming text accumulation; `suggestStream()` callback → append tokens to state (FR-006). On stream complete: parse suggestions, match item thumbnails from wardrobe store. Session-scoped persistence via Zustand — store suggestions in a dedicated slice or extend `useWardrobeStore`. `useEffect` cleanup for abort controller. Match Vue `OutfitsView.vue` layout exactly.
- [x] T027 [US4] Add outfit suggestions persistence to Zustand — either extend an existing store or create `apps/frontend-react/src/stores/useOutfitStore.js` to hold `suggestions`, `streamingText`, `occasion` across navigation. State resets on logout but survives route changes.

**Checkpoint**: Outfit streaming works end-to-end. SC-004 (streaming begins within 5s) is validated. Session persistence works across navigation.

---

## Phase 7: User Story 5 — Visual & UX Parity (Priority: P2)

**Goal**: The React version is visually indistinguishable from the Vue version at all breakpoints.

**Independent Test**: Run Vue (`localhost:5173`) and React (`localhost:5174`) side-by-side. Compare every page at 375px and 1440px widths.

### Implementation

- [x] T028 [US5] Visual audit — compare every page side-by-side at 375px (mobile) and 1440px (desktop). Fix any layout, typography, color, or spacing discrepancies. Verify custom colors (cream, sand, espresso, terracotta, charcoal) and fonts (Playfair Display, Inter) render identically.
- [x] T029 [P] [US5] Verify hover effects — clothing card scale-up + shadow animation must match Vue version exactly on all card instances.
- [x] T030 [P] [US5] Verify page transitions — fade/slide animation between routes must match Vue version timing and easing.
- [x] T031 [US5] Responsive layout audit — test at 320px, 375px, 768px, 1024px, 1440px. Fix any breakpoint-specific discrepancies.

**Checkpoint**: SC-002 (visual parity at 375px and 1440px) is fully validated. All pages visually match.

---

## Phase 8: Polish & Final Swap

**Purpose**: Final validation, cleanup, and directory swap.

- [x] T032 Run full quickstart.md validation checklist — verify every checkbox in the Authentication, Wardrobe, Upload, Outfits, and Visual Parity sections.
- [x] T033 Verify memory leak prevention — confirm object URLs are revoked in BatchUploadPage cleanup; confirm no dangling event listeners or timers (FR-014).
- [x] T034 Verify token continuity — log in via Vue app, switch to React app at same localStorage, confirm user is still authenticated (FR-003).
- [x] T035 Final swap — remove `apps/frontend/` (old Vue), rename `apps/frontend-react/` → `apps/frontend/`. Update `tailwind.config.js` content paths if they reference `frontend-react`. Run `pnpm build` and verify successful production build (SC-006).

**Checkpoint**: SC-001 through SC-007 all pass. Migration is complete.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on T001 (package install) — BLOCKS all user stories
- **US1 Auth (Phase 3)**: Depends on Phase 2 completion (stores, routing, ProtectedRoute)
- **US2 Wardrobe (Phase 4)**: Depends on Phase 2 completion; benefits from US1 (need to log in)
- **US3 Upload (Phase 5)**: Depends on Phase 2 completion; benefits from US2 (view uploaded items)
- **US4 Outfits (Phase 6)**: Depends on Phase 2 completion; benefits from US2 (needs wardrobe items)
- **US5 Visual Parity (Phase 7)**: Depends on US1–US4 being functionally complete
- **Polish (Phase 8)**: Depends on all phases complete

### Within Each User Story

- All [P] tasks within a phase can run in parallel
- Non-[P] tasks run sequentially in listed order
- Commit after each task or logical group

### Parallel Opportunities

- T002–T006 can all run in parallel (independent config files)
- T008–T009 can run in parallel (independent stores)
- T010–T012 can run in parallel (independent components)
- T015–T016 can run in parallel (independent pages)
- T019 can run in parallel with T020 start (card component before page)
- T024 can run in parallel with T022–T023 (hook independent of pages)
- T029–T030 can run in parallel (independent visual checks)

---

## Implementation Strategy

### Recommended: Sequential by Priority

1. Complete Phase 1: Setup → verify dev server starts
2. Complete Phase 2: Foundational → verify routing shell works
3. Complete Phase 3: US1 Auth → verify full auth flow
4. Complete Phase 4: US2 Wardrobe → verify browsing and management
5. Complete Phase 5: US3 Upload → verify single and batch upload with streaming
6. Complete Phase 6: US4 Outfits → verify streaming suggestions
7. Complete Phase 7: US5 Visual Parity → side-by-side validation
8. Complete Phase 8: Polish → final swap and build verification

Each phase builds on the previous and can be validated independently before proceeding.

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- HIGH COMPLEXITY tasks: T023 (BatchUploadPage) and T026 (OutfitsPage) — these are the two most complex components in the migration
- All file paths are relative to `apps/frontend-react/` unless otherwise noted
- Commit after each task or logical group
- Stop at any checkpoint to validate progress
