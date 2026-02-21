# Quickstart: React Frontend Development

**Phase 1 output** | **Date**: 2026-02-14

## Prerequisites

- Node.js 18+ with pnpm
- Python 3.11+ with Django backend running (for API proxy)
- PostgreSQL running with existing database

## Setup

1. **Start the backend** (unchanged from current workflow):

   ```bash
   cd apps/backend
   python manage.py runserver
   ```

2. **Install React frontend dependencies**:

   ```bash
   cd apps/frontend-react
   pnpm install
   ```

3. **Start the React dev server**:

   ```bash
   pnpm dev
   ```

   The React app runs on `http://localhost:5174` (port 5174 to avoid
   conflict with the Vue app on 5173). The Vite proxy forwards `/api`
   and `/media` requests to the Django backend on port 8000.

4. **(Optional) Run Vue and React side-by-side**:

   ```bash
   # Terminal 1: Backend
   cd apps/backend && python manage.py runserver

   # Terminal 2: Vue frontend (existing)
   cd apps/frontend && pnpm dev
   # → http://localhost:5173

   # Terminal 3: React frontend (new)
   cd apps/frontend-react && pnpm dev
   # → http://localhost:5174
   ```

   Both frontends share the same backend and database, so the same
   user account and wardrobe data are visible in both.

## Validation Checklist

Run through these checks to confirm feature parity:

### Authentication (US1)
- [ ] Sign up a new user at `/signup`
- [ ] Log in with the new user at `/login`
- [ ] Confirm authenticated nav appears (My Wardrobe, Get Outfits, Logout)
- [ ] Log out and confirm redirect to `/login`
- [ ] Confirm protected routes redirect to `/login` when not authenticated
- [ ] Confirm guest routes redirect to `/wardrobe` when authenticated

### Wardrobe (US2)
- [ ] View wardrobe gallery at `/wardrobe`
- [ ] Filter by item type
- [ ] Click an item to view details at `/wardrobe/:id`
- [ ] Edit an item attribute and save
- [ ] Delete an item

### Upload (US3)
- [ ] Upload a single item at `/wardrobe/add`
- [ ] Batch upload at `/wardrobe/batch-add` — verify progress indicators
- [ ] Drag-and-drop files onto the batch upload area
- [ ] (If configured) Import from Google Photos
- [ ] Cancel a batch upload mid-progress

### Outfits (US4)
- [ ] Request outfit suggestions at `/outfits`
- [ ] Confirm streaming text appears progressively
- [ ] Confirm suggestions show item thumbnails and explanations
- [ ] Navigate away and back — confirm results persist
- [ ] Click an example occasion prompt

### Visual Parity (US5)
- [ ] Compare home page side-by-side at 375px and 1440px
- [ ] Confirm hover effects on clothing cards match
- [ ] Confirm page transitions match
- [ ] Confirm color palette and typography match

## Final Swap

Once all checks pass:

```bash
# From repository root
rm -rf apps/frontend
mv apps/frontend-react apps/frontend
```

Update `tailwind.config.js` content paths if they reference
`frontend-react` anywhere, and verify the app still builds:

```bash
cd apps/frontend
pnpm build
```
