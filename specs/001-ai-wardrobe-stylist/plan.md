# Implementation Plan: AI Wardrobe Stylist

**Branch**: `001-ai-wardrobe-stylist` | **Date**: 2026-02-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-ai-wardrobe-stylist/spec.md`

## Summary

Build a gender-neutral, culturally-aware AI wardrobe stylist that lets users
upload clothing photos for AI analysis, then request occasion-based outfit
suggestions composed exclusively of their own items. The existing codebase
already provides the foundational CRUD, auth, AI provider abstraction, and
streaming infrastructure. This plan focuses on the delta: gender-neutral
prompts, cultural awareness, AI-unavailability graceful degradation with
queued analysis, session-scoped suggestion persistence in the frontend, and
AI response validation/sanitization before rendering.

## Technical Context

**Language/Version**: Python 3.11+ (backend), JavaScript ES2022 (frontend)
**Primary Dependencies**: Django 5 + DRF (backend), Vue 3 + Vite (frontend),
Pinia (state), Tailwind CSS (styling), Ollama (AI inference)
**Storage**: PostgreSQL (relational data), filesystem `media/` (images)
**Testing**: pytest + pytest-django (backend), optional
**Target Platform**: Web (mobile-first responsive)
**Project Type**: Web application (frontend + backend)
**Performance Goals**: First streaming token within 5 seconds (SC-006);
200-item wardrobes without degradation (SC-007)
**Constraints**: Local AI inference via Ollama; no external cloud AI APIs
**Scale/Scope**: Single-user focus; up to 200 items per wardrobe

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate | Status |
|-----------|------|--------|
| I. UX-First | UI uses established design tokens (cream/sand/espresso/terracotta/charcoal); mobile-primary; optimistic updates & skeleton states preferred over spinners | PASS — existing views follow palette; streaming provides progressive feedback; batch upload has real-time progress |
| II. Ship & Iterate | No premature abstractions; small focused changes; YAGNI | PASS — plan targets only spec-required deltas; no speculative features |
| III. AI as Core | Provider behind AIProvider abstraction; prompts version-controlled; AI output validated before UI | PASS (partial) — abstraction exists; prompts are in code but need gender-neutral + cultural updates; **AI output validation needs implementation** |

**Action required**: AI response validation/sanitization (Principle III) is
a gap. Addressed in Phase 1 design below.

## Project Structure

### Documentation (this feature)

```text
specs/001-ai-wardrobe-stylist/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── api.md           # REST endpoint contracts
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
apps/
├── backend/
│   ├── accounts/
│   │   ├── models.py          # User (AbstractUser, UUID pk, email-based)
│   │   ├── serializers.py     # UserSerializer, SignupSerializer
│   │   ├── views.py           # SignupView, MeView
│   │   └── urls.py            # /api/auth/*
│   ├── ai/
│   │   └── providers.py       # AIProvider, OllamaProvider, PlaceholderProvider
│   ├── wardrobe/
│   │   ├── models.py          # ClothingItem, OutfitSuggestion
│   │   ├── serializers.py     # CRUD + outfit request serializers
│   │   ├── views.py           # ViewSets, batch upload, outfit streaming
│   │   ├── image_utils.py     # Image compression (WEBP, 800px max)
│   │   └── urls.py            # /api/wardrobe/*, /api/outfits/*
│   └── config/
│       ├── settings.py        # Django settings, JWT, CORS, AI config
│       └── urls.py            # Root URL routing
└── frontend/
    └── src/
        ├── api/index.js       # Axios instance, SSE streaming helpers
        ├── stores/
        │   ├── auth.js        # JWT auth state + actions
        │   └── wardrobe.js    # Wardrobe items state + CRUD actions
        ├── views/
        │   ├── HomeView.vue
        │   ├── LoginView.vue
        │   ├── SignupView.vue
        │   ├── WardrobeView.vue
        │   ├── AddItemView.vue
        │   ├── BatchUploadView.vue
        │   ├── ItemDetailView.vue
        │   └── OutfitsView.vue
        ├── components/
        │   └── ClothingCard.vue
        ├── composables/
        │   └── useGooglePhotos.js
        └── router/index.js
```

**Structure Decision**: Web application layout under `apps/backend/` and
`apps/frontend/`. This matches the existing repository structure exactly.

## Complexity Tracking

No constitution violations requiring justification. All changes are
incremental deltas to existing code.
