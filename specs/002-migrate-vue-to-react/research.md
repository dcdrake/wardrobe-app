# Research: Migrate Frontend from Vue 3 to React

**Phase 0 output** | **Date**: 2026-02-14

## Decision 1: React State Management Library

**Decision**: Zustand

**Rationale**: The existing Pinia stores (auth, wardrobe) are small
composition-API stores with `ref()`, `computed()`, and async actions.
Zustand is the closest React equivalent — minimal boilerplate, hook-based,
supports async actions natively, and doesn't require a provider wrapper.
Redux Toolkit would be over-engineered for 2 small stores. React Context
would cause unnecessary re-renders for high-frequency updates during SSE
streaming.

**Alternatives considered**:
- Redux Toolkit: Too much boilerplate for 2 stores with ~40 lines each.
- React Context + useReducer: Re-render issues with streaming state.
- Jotai/Recoil: Atom-based model doesn't map well to the existing
  store-per-domain pattern.

## Decision 2: Routing Library

**Decision**: React Router v6 (react-router-dom)

**Rationale**: The existing Vue Router setup uses `beforeEach` navigation
guards with `meta.auth` / `meta.guest` flags. React Router v6 handles
this with layout route wrappers (`<ProtectedRoute>`, `<GuestRoute>`).
Lazy imports via `React.lazy()` replace Vue's `() => import()` pattern.
Route paths remain identical (FR-002).

**Alternatives considered**:
- TanStack Router: Type-safe but adds complexity for a migration where
  the route structure is already defined and simple.
- Wouter: Too minimal — lacks layout routes needed for auth guards.

## Decision 3: Page Transition Approach

**Decision**: CSS transitions with a lightweight wrapper component

**Rationale**: The existing Vue app uses `<Transition name="page"
mode="out-in">` with CSS keyframes (opacity + translateY). React
doesn't have a built-in `<Transition>` component. Rather than adding
a heavy dependency like Framer Motion, a simple `<PageTransition>`
wrapper component using CSS `@keyframes` and `useLocation()` from React
Router achieves the same effect with zero added bundle size.

**Alternatives considered**:
- Framer Motion: Full animation library is overkill for a single
  fade/slide transition — violates Ship & Iterate (YAGNI).
- React Transition Group: Closer to Vue's `<Transition>` API but
  adds a dependency for something achievable with pure CSS.
- No transitions: Would fail FR-009 and SC-002 (visual parity).

## Decision 4: SSE Streaming Architecture

**Decision**: Reuse existing `fetch()` + `ReadableStream` parser as a
shared utility; consume via custom React hooks.

**Rationale**: The Vue API layer (`api/index.js`) already implements SSE
parsing with `fetch()`, `ReadableStream`, and `AbortController`. This
code is framework-agnostic — it uses callbacks (`onItem`, `onToken`,
`onDone`, `onError`) not Vue reactivity. The React version copies this
utility verbatim and wraps it in React hooks (`useBatchUpload`,
`useOutfitStream`) that bridge callbacks to `useState` updates.

**Alternatives considered**:
- EventSource API: Doesn't support POST requests; batch upload and
  outfit suggestion endpoints use POST.
- Third-party SSE library (eventsource-parser): Adds a dependency for
  functionality that already works in the existing codebase.

## Decision 5: Google Photos Integration

**Decision**: Convert Vue composable to React hook with identical
external API behavior.

**Rationale**: The `useGooglePhotos` composable loads Google GIS, GAPI,
and Picker scripts dynamically, manages OAuth2 token flow, and returns
selected photos. The logic depends on `window.google` and `window.gapi`
globals — not Vue reactivity. The React hook version replaces `ref()`
with `useState()` and `computed()` with `useMemo()`. The script loading,
OAuth flow, and Picker configuration remain byte-for-byte identical.

**Alternatives considered**:
- React-specific Google Photos library: None exist that wrap the Picker
  API with the same level of control.
- Drop Google Photos support: Would violate FR-007.

## Decision 6: HTTP Client

**Decision**: Keep Axios with identical interceptor pattern.

**Rationale**: The existing Axios instance with request interceptor
(JWT injection) and response interceptor (401 refresh + retry) is
framework-agnostic. The React version copies it directly. Switching
to native `fetch()` would require reimplementing interceptor logic
for no user benefit.

**Alternatives considered**:
- Native fetch: Would require manual interceptor logic for token
  refresh. No benefit since Axios already works.
- TanStack Query: Useful for caching/deduplication but adds complexity
  for a migration where behavior must be identical, not improved.
