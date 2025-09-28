<template>
  <div id="app" class="min-h-screen">
    <!-- Main content -->
    <main>
      <router-view />
    </main>
    
    <!-- Notifications -->
    <NotificationContainer />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useThemeStore } from './stores/themeStore'
import NotificationContainer from './components/NotificationContainer.vue'

const themeStore = useThemeStore()

onMounted(async () => {
  await themeStore.loadTheme()
})
</script>
