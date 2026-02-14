# Implementation Plan: Migrate Frontend from Vue 3 to React

**Branch**: `002-migrate-vue-to-react` | **Date**: 2026-02-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-migrate-vue-to-react/spec.md`

## Summary

Replace the Vue 3 frontend with a React 18+ equivalent that is
functionally and visually identical. The Django backend, PostgreSQL
database, and all API endpoints remain untouched. The React app is built
in a parallel directory (`apps/frontend-react/`) alongside the existing
Vue app, allowing side-by-side validation. Once the React version passes
all success criteria, it replaces the Vue directory and the Vue code is
removed.

The migration scope covers: 8 views, 2 Pinia stores (→ Zustand), 1 API
layer with SSE streaming, 1 Google Photos composable (→ hook), Vue
Router (→ React Router v6), page transitions, and the full Tailwind
design system.

## Technical Context

**Language/Version**: JavaScript ES2022+ / JSX (frontend only)
**Primary Dependencies**: React 18+, React Router v6, Zustand (state),
Axios (HTTP), Tailwind CSS 3.4 (styling), Vite 5 (build)
**Storage**: N/A (frontend-only; backend unchanged)
**Testing**: Optional per constitution; manual validation against Vue
**Target Platform**: Web (mobile-first responsive)
**Project Type**: Web application (frontend migration)
**Performance Goals**: Visual parity; streaming first-token <5s (SC-004)
**Constraints**: No backend changes; same localStorage keys; same routes
**Scale/Scope**: 8 views, ~800 lines of Vue → ~900 lines of React/JSX

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate | Status |
|-----------|------|--------|
| I. UX-First | Warm editorial aesthetic preserved; mobile-primary; same design tokens; same page transitions | PASS — FR-008 mandates exact Tailwind config; FR-009 mandates transitions; SC-002 mandates visual parity |
| II. Ship & Iterate | No premature abstractions; focused migration with no new features | PASS — spec explicitly scopes to "pure framework swap, no new features" |
| III. AI as Core | AI provider abstraction untouched (backend); AI output validated before UI rendering | PASS — backend unchanged; React frontend inherits same rendering safeguards |

**Post-Phase 1 re-check**: PASS. No design decisions introduced that
violate constitution principles. The parallel-build strategy (Ship &
Iterate) allows incremental validation.

## Project Structure

### Documentation (this feature)

```text
specs/002-migrate-vue-to-react/
├── plan.md              # This file
├── research.md          # Phase 0: technology decisions
├── data-model.md        # Phase 1: component mapping (no DB changes)
├── quickstart.md        # Phase 1: dev setup for React frontend
├── contracts/
│   └── component-map.md # Phase 1: Vue → React component mapping
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
apps/
├── backend/                    # UNCHANGED — no modifications
│   ├── accounts/
│   ├── ai/
│   ├── wardrobe/
│   └── config/
├── frontend/                   # EXISTING Vue app (kept during migration)
│   ├── src/
│   │   ├── api/index.js
│   │   ├── stores/{auth,wardrobe}.js
│   │   ├── views/*.vue (8 views)
│   │   ├── components/ClothingCard.vue
│   │   ├── composables/useGooglePhotos.js
│   │   └── router/index.js
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
└── frontend-react/             # NEW React app (parallel build)
    ├── src/
    │   ├── api/index.js               # Axios + SSE streaming (adapted)
    │   ├── stores/
    │   │   ├── useAuthStore.js         # Zustand auth store
    │   │   └── useWardrobeStore.js     # Zustand wardrobe store
    │   ├── hooks/
    │   │   └── useGooglePhotos.js      # Google Photos React hook
    │   ├── pages/
    │   │   ├── HomePage.jsx
    │   │   ├── LoginPage.jsx
    │   │   ├── SignupPage.jsx
    │   │   ├── WardrobePage.jsx
    │   │   ├── AddItemPage.jsx
    │   │   ├── BatchUploadPage.jsx
    │   │   ├── ItemDetailPage.jsx
    │   │   └── OutfitsPage.jsx
    │   ├── components/
    │   │   ├── ClothingCard.jsx
    │   │   ├── ProtectedRoute.jsx
    │   │   └── PageTransition.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── assets/main.css            # Copied from Vue (Tailwind directives)
    ├── tailwind.config.js             # Copied from Vue (content paths updated)
    ├── postcss.config.js              # Copied from Vue (unchanged)
    ├── vite.config.js                 # React plugin instead of Vue
    ├── index.html                     # Copied from Vue (entry point adapted)
    └── package.json                   # React dependencies
```

**Structure Decision**: Parallel directory `apps/frontend-react/`
alongside existing `apps/frontend/`. After validation, `frontend-react/`
is renamed to `frontend/` and the old Vue directory is deleted.

## Complexity Tracking

No constitution violations requiring justification. All changes are
a 1:1 framework swap within the frontend layer.
