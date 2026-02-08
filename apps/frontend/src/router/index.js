import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  { path: '/', component: () => import('../views/HomeView.vue') },
  { path: '/login', component: () => import('../views/LoginView.vue'), meta: { guest: true } },
  { path: '/signup', component: () => import('../views/SignupView.vue'), meta: { guest: true } },
  { path: '/wardrobe', component: () => import('../views/WardrobeView.vue'), meta: { auth: true } },
  { path: '/wardrobe/add', component: () => import('../views/AddItemView.vue'), meta: { auth: true } },
  { path: '/wardrobe/batch-add', component: () => import('../views/BatchUploadView.vue'), meta: { auth: true } },
  { path: '/wardrobe/:id', component: () => import('../views/ItemDetailView.vue'), meta: { auth: true } },
  { path: '/outfits', component: () => import('../views/OutfitsView.vue'), meta: { auth: true } },
]

const router = createRouter({ history: createWebHistory(), routes })

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()
  if (to.meta.auth && !auth.isAuthenticated) next('/login')
  else if (to.meta.guest && auth.isAuthenticated) next('/wardrobe')
  else next()
})

export default router
