import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { registerSW } from 'virtual:pwa-register'
import App from './App.vue'
import router from './router'
import './style.css'

// Performance optimizations
const app = createApp(App)

// Configure Pinia with performance optimizations
const pinia = createPinia()
app.use(pinia)
app.use(router)

// Mount app
app.mount('#app')

// Register service worker with enhanced PWA features
registerSW({
  onNeedRefresh() {
    console.log('New content available, please refresh')
    // Could show a notification to user here
  },
  onOfflineReady() {
    console.log('App ready to work offline')
  },
  onRegistered(registration) {
    console.log('SW registered:', registration)
  },
  onRegisterError(error) {
    console.log('SW registration error', error)
  }
})
