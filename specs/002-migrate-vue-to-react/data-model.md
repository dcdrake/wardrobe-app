# Data Model: Migrate Frontend from Vue 3 to React

**Phase 1 output** | **Date**: 2026-02-14

## Overview

This migration involves **zero database or backend model changes**. The
data model section documents the frontend state shape — the Zustand
stores that replace Pinia stores — and the component hierarchy that
replaces Vue's SFC structure.

## Frontend State: Auth Store

**Vue source**: `apps/frontend/src/stores/auth.js` (Pinia)
**React target**: `apps/frontend-react/src/stores/useAuthStore.js` (Zustand)

### State Shape

| Field           | Type              | Default            | Notes                          |
|-----------------|-------------------|--------------------|--------------------------------|
| user            | Object \| null    | null               | `{id, email, username}`        |
| token           | String \| null    | from localStorage  | JWT access token               |
| isAuthenticated | Boolean (derived) | `!!token`          | Computed in Vue; derived selector in Zustand |

### Actions

| Action      | Input                   | Behavior                                              |
|-------------|-------------------------|-------------------------------------------------------|
| signup      | email, password         | POST /auth/signup/ → login()                          |
| login       | email, password         | POST /auth/login/ → save tokens → fetchUser → redirect |
| fetchUser   | (none)                  | GET /auth/me/ → set user                              |
| logout      | (none)                  | Clear state + localStorage → redirect to /login       |

### localStorage Keys (MUST match Vue — FR-003)

- `access_token`
- `refresh_token`

## Frontend State: Wardrobe Store

**Vue source**: `apps/frontend/src/stores/wardrobe.js` (Pinia)
**React target**: `apps/frontend-react/src/stores/useWardrobeStore.js` (Zustand)

### State Shape

| Field     | Type          | Default | Notes                    |
|-----------|---------------|---------|--------------------------|
| items     | Array\<Item\> | []      | Full wardrobe item list  |
| loading   | Boolean       | false   | Fetch-in-progress flag   |
| itemCount | Number        | derived | `items.length`           |

### Item Shape (from API response)

| Field              | Type           | Notes                                  |
|--------------------|----------------|----------------------------------------|
| id                 | UUID (string)  | Primary key                            |
| image_url          | String         | Relative URL to compressed image       |
| item_type          | String         | Enum key (e.g., "tshirt", "blazer")    |
| item_type_display  | String         | Human label (e.g., "T-Shirt", "Blazer")|
| colors             | Array\<String\>| e.g., ["navy", "white"]                |
| pattern            | String         | solid, striped, plaid, etc.            |
| material           | String         | cotton, wool, leather, etc.            |
| formality          | String         | casual, smart_casual, etc.             |
| formality_display  | String         | Human label                            |
| brand              | String         | Optional                               |
| notes              | String         | Optional                               |
| created_at         | ISO datetime   |                                        |

### Actions

| Action      | Input           | Behavior                                        |
|-------------|-----------------|-------------------------------------------------|
| fetchItems  | (none)          | GET /wardrobe/ → set items                      |
| addItem     | FormData        | POST /wardrobe/ → prepend to items              |
| updateItem  | id, data        | PATCH /wardrobe/:id/ → update in place           |
| deleteItem  | id              | DELETE /wardrobe/:id/ → remove from items        |
| analyzeItem | id              | POST /wardrobe/:id/analyze/ → update in place    |
| getItemById | id              | Find item in local array                         |

## Component Hierarchy

```text
App.jsx
├── NavBar (inline in App)
│   ├── Logo (RouterLink → /)
│   ├── Auth nav: My Wardrobe, Get Outfits, Logout
│   └── Guest nav: Login, Sign Up
├── PageTransition (wraps Routes)
│   └── Routes
│       ├── / → HomePage
│       ├── /login → LoginPage (GuestRoute)
│       ├── /signup → SignupPage (GuestRoute)
│       ├── /wardrobe → WardrobePage (ProtectedRoute)
│       │   └── ClothingCard (×N)
│       ├── /wardrobe/add → AddItemPage (ProtectedRoute)
│       ├── /wardrobe/batch-add → BatchUploadPage (ProtectedRoute)
│       ├── /wardrobe/:id → ItemDetailPage (ProtectedRoute)
│       └── /outfits → OutfitsPage (ProtectedRoute)
```

## State Transitions: Batch Upload

```text
[idle] → user selects files → [selection]
[selection] → user clicks upload → [uploading]
[uploading] → SSE "item" event → update item[N].status
[uploading] → SSE "done" event → [done]
[uploading] → SSE "error" event → mark item[N] as error
[uploading] → user clicks cancel → abort controller → [done]
[done] → user clicks "Back to Wardrobe" → navigate away
```

Item-level states: `pending` → `processing` → `done` | `error`

## State Transitions: Outfit Streaming

```text
[idle] → user submits occasion → [streaming]
[streaming] → SSE "token" event → append to streamingText
[streaming] → SSE "done" event → parse suggestions → [results]
[streaming] → SSE "error" event → [error]
[results] → user navigates away → state preserved in Zustand
[results] → user submits new occasion → [streaming]
```
