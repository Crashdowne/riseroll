import { createRouter, createWebHistory } from 'vue-router'

// Lazy load components for better performance
const Picker = () => import('../views/Picker.vue')
const Activities = () => import('../views/Activities.vue')

const routes = [
  {
    path: '/',
    name: 'Picker',
    component: Picker,
    meta: { title: 'RiseRoll - Pick Activity' }
  },
  {
    path: '/activities',
    name: 'Activities',
    component: Activities,
    meta: { title: 'RiseRoll - Manage Activities' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Update document title on route change
router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = to.meta.title
  }
  next()
})

export default router
