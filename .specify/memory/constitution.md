<!--
SYNC IMPACT REPORT
==================
Version change: 0.0.0 → 1.0.0 (MAJOR — initial ratification)

Modified principles: N/A (first version)

Added sections:
  - Core Principles (3): UX-First, Ship & Iterate, AI as Core
  - Technology & Constraints
  - Governance

Removed sections: N/A (first version)

Templates requiring updates:
  - .specify/templates/plan-template.md — ✅ no update needed
    (Constitution Check section is generic; plan authors fill per-feature)
  - .specify/templates/spec-template.md — ✅ no update needed
    (user-story and requirements structure already compatible)
  - .specify/templates/tasks-template.md — ✅ no update needed
    (task phases and parallel markers compatible with lean principles)

Follow-up TODOs: none
-->

# The Wardrobe Constitution

## Core Principles

### I. UX-First

Every decision — from API response shape to database schema — MUST be
evaluated through the lens of the end-user experience. The app presents
a warm, editorial magazine aesthetic with serif typography, muted earth
tones, and generous whitespace. Features that degrade perceived
performance, introduce visual clutter, or break the curated feel MUST
be redesigned before shipping.

- UI MUST remain responsive and feel instant; prefer optimistic updates
  and skeleton states over blocking spinners.
- New screens and components MUST follow the established Tailwind design
  tokens (cream, sand, espresso, terracotta, charcoal palette).
- Mobile viewport MUST be treated as the primary target; desktop is an
  enhancement.

### II. Ship & Iterate

Favor working software over comprehensive up-front design. Small,
focused changes that deliver user value MUST be preferred over large,
speculative refactors.

- Merge to `develop` early and often; keep PRs small and
  single-purpose.
- Avoid premature abstractions — duplicate code is acceptable until a
  pattern proves itself across three or more call sites.
- YAGNI applies: do not build features, configuration knobs, or
  extensibility points that have no current user need.

### III. AI as Core

AI-powered features (clothing analysis, outfit suggestions) are the
product's differentiator, not a nice-to-have. All AI integration work
MUST be treated with the same rigor as core business logic.

- AI provider contracts MUST remain behind the `AIProvider` abstraction
  so providers can be swapped without touching business logic.
- Prompts MUST be version-controlled alongside code; prompt changes
  MUST be reviewed like code changes.
- AI responses MUST be validated and sanitized before surfacing to the
  user; never render raw model output directly in the UI.

## Technology & Constraints

**Stack**: Vue 3 + Vite + Tailwind CSS (frontend) / Django 5 + DRF +
PostgreSQL (backend) / Ollama for local AI inference.

- Frontend state management uses Pinia; routing uses Vue Router.
- Backend authentication uses SimpleJWT; CORS handled by
  django-cors-headers.
- Images are processed server-side (Pillow) and stored in `media/`.
- Python version: 3.11+. Node managed via pnpm.
- Linting: Ruff (backend), ESLint (frontend).
- Testing is encouraged but optional; when tests exist they MUST pass
  before merge.

## Governance

This constitution is the authoritative source for project-wide
principles. When a PR or design decision conflicts with a principle
above, the principle takes precedence unless an amendment is ratified
first.

**Amendment process**:
1. Propose the change in a PR that modifies this file.
2. Document the rationale in the PR description.
3. Update the version number following semver (MAJOR for principle
   removal/redefinition, MINOR for additions, PATCH for clarifications).
4. Propagate changes to dependent templates listed in the Sync Impact
   Report at the top of this file.

**Version**: 1.0.0 | **Ratified**: 2026-02-14 | **Last Amended**: 2026-02-14
