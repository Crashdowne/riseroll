import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          }
        ]
      },
      includeAssets: ['favicon-16x16.png', 'favicon-32x32.png', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'RiseRoll - Morning Activity Picker',
        short_name: 'RiseRoll',
        description: 'A Progressive Web App for randomly picking daily morning activities with re-roll limits and activity management',
        theme_color: '#1A2B4D',
        background_color: '#1A2B4D',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        scope: '/',
        lang: 'en',
        categories: ['productivity', 'lifestyle', 'utilities'],
        screenshots: [
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            form_factor: 'narrow'
          }
        ],
        shortcuts: [
          {
            name: 'Pick Activity',
            short_name: 'Pick',
            description: 'Quickly pick a morning activity',
            url: '/',
            icons: [
              {
                src: 'favicon-32x32.png',
                sizes: '32x32'
              }
            ]
          },
          {
            name: 'Manage Activities',
            short_name: 'Manage',
            description: 'Add, edit, or delete activities',
            url: '/activities',
            icons: [
              {
                src: 'favicon-32x32.png',
                sizes: '32x32'
              }
            ]
          }
        ],
        icons: [
          {
            src: 'favicon-16x16.png',
            sizes: '16x16',
            type: 'image/png'
          },
          {
            src: 'favicon-32x32.png',
            sizes: '32x32',
            type: 'image/png'
          },
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'pinia', 'vue-router'],
          dexie: ['dexie', '@vueuse/rxjs'],
          icons: ['@heroicons/vue']
        }
      }
    }
  }
})
