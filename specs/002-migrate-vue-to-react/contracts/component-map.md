# Component Map: Vue → React

**Phase 1 output** | **Date**: 2026-02-14

This document maps every Vue source file to its React equivalent,
documenting the pattern transformations required.

## Build & Configuration

| Vue File | React File | Changes |
|----------|-----------|---------|
| `package.json` | `package.json` | Replace vue/pinia/vue-router with react/react-dom/zustand/react-router-dom; swap @vitejs/plugin-vue for @vitejs/plugin-react |
| `vite.config.js` | `vite.config.js` | Replace `vue()` plugin with `react()` plugin; proxy config unchanged |
| `tailwind.config.js` | `tailwind.config.js` | Update `content` paths from `**/*.vue` to `**/*.{js,jsx}` |
| `postcss.config.js` | `postcss.config.js` | Copied verbatim |
| `index.html` | `index.html` | Change `main.js` to `main.jsx`; rest unchanged |

## Entry Points

| Vue File | React File | Pattern Changes |
|----------|-----------|-----------------|
| `src/main.js` | `src/main.jsx` | `createApp().use(pinia).use(router).mount()` → `createRoot().render(<App/>)` with `<BrowserRouter>` wrapper |
| `src/App.vue` | `src/App.jsx` | `<script setup>` → functional component; `<RouterView>` → `<Routes>`; `<Transition>` → `<PageTransition>`; `v-if/v-else` → ternary |

## State Management

| Vue File | React File | Pattern Changes |
|----------|-----------|-----------------|
| `src/stores/auth.js` | `src/stores/useAuthStore.js` | `defineStore()` → `create()`; `ref()` → state properties; `computed()` → derived selector; router.push inside action → return value, navigate in component |
| `src/stores/wardrobe.js` | `src/stores/useWardrobeStore.js` | Same pattern as auth; array mutations via Zustand `set()` with spread |

## API Layer

| Vue File | React File | Pattern Changes |
|----------|-----------|-----------------|
| `src/api/index.js` | `src/api/index.js` | Axios instance + interceptors: copied verbatim (framework-agnostic). SSE streaming functions (`batchUpload`, `googlePhotosUpload`, `suggestStream`): copied verbatim — they use callbacks, not Vue reactivity |

## Hooks (from Composables)

| Vue File | React File | Pattern Changes |
|----------|-----------|-----------------|
| `src/composables/useGooglePhotos.js` | `src/hooks/useGooglePhotos.js` | `ref()` → `useState()`; `computed()` → `useMemo()`; exported function signature identical; script loading + OAuth + Picker logic unchanged |

## Pages (from Views)

| Vue File | React File | Complexity | Key Pattern Changes |
|----------|-----------|------------|---------------------|
| `views/HomeView.vue` | `pages/HomePage.jsx` | Low | `computed()` → `useMemo()`; `<RouterLink>` → `<Link>` |
| `views/LoginView.vue` | `pages/LoginPage.jsx` | Low | `ref()` → `useState()`; `v-model` → `value` + `onChange`; `@submit.prevent` → `onSubmit` with `e.preventDefault()` |
| `views/SignupView.vue` | `pages/SignupPage.jsx` | Low | Same as LoginPage pattern |
| `views/WardrobeView.vue` | `pages/WardrobePage.jsx` | Low | `onMounted()` → `useEffect([], [])`; `computed()` filter → `useMemo()`; `v-for` → `.map()` |
| `views/AddItemView.vue` | `pages/AddItemPage.jsx` | Medium | Template ref for file input → `useRef()`; FormData construction identical; grouped `<optgroup>` rendering via `.map()` |
| `views/ItemDetailView.vue` | `pages/ItemDetailPage.jsx` | Low | `useRoute()` → `useParams()`; editing toggle via `useState()` |
| `views/BatchUploadView.vue` | `pages/BatchUploadPage.jsx` | **High** | 5+ `ref()` → 5+ `useState()`; drag-drop → native handlers; SSE callbacks → `useState` updates; `URL.revokeObjectURL` in `useEffect` cleanup |
| `views/OutfitsView.vue` | `pages/OutfitsPage.jsx` | **High** | Streaming text accumulation → `useState` with callback ref; session-scoped persistence → Zustand store for suggestions |

## Components

| Vue File | React File | Pattern Changes |
|----------|-----------|-----------------|
| `components/ClothingCard.vue` | `components/ClothingCard.jsx` | `defineProps()` → function props; `<RouterLink>` → `<Link>` |
| (none — inline in router) | `components/ProtectedRoute.jsx` | New: wraps `<Outlet>` with auth check + `<Navigate>` |
| (none — Vue `<Transition>`) | `components/PageTransition.jsx` | New: CSS-based route transition wrapper using `useLocation()` key |

## Styling

| Vue File | React File | Changes |
|----------|-----------|---------|
| `src/assets/main.css` | `src/assets/main.css` | Copied verbatim (Tailwind directives + custom CSS). Vue transition classes (`.page-enter-active` etc.) retained for PageTransition component |

## Pattern Quick Reference

| Vue Pattern | React Equivalent |
|-------------|-----------------|
| `ref(x)` | `useState(x)` |
| `computed(() => ...)` | `useMemo(() => ..., [deps])` |
| `watch(x, cb)` | `useEffect(() => cb(), [x])` |
| `onMounted(cb)` | `useEffect(cb, [])` |
| `onUnmounted(cb)` | `useEffect(() => () => cb(), [])` |
| `v-model="x"` | `value={x} onChange={e => setX(e.target.value)}` |
| `v-if="cond"` | `{cond && <Component/>}` |
| `v-for="item in items"` | `{items.map(item => <Component key={...}/>)}` |
| `@click="handler"` | `onClick={handler}` |
| `@submit.prevent` | `onSubmit={e => { e.preventDefault(); ... }}` |
| `:class="{ active: x }"` | `className={x ? 'active' : ''}` |
| `<RouterLink to="/">` | `<Link to="/">` |
| `useRoute().params.id` | `useParams().id` |
| `router.push('/path')` | `navigate('/path')` |
| `<Transition>` | `<PageTransition>` (custom) |
