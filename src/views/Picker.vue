<template>
  <div class="min-h-screen bg-[#1A2B4D] dark:bg-gray-900 text-white transition-colors" :class="{ 'pb-80': isKeyboardOpen }">
    <!-- Header -->
    <div class="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 border-b border-gray-600 dark:border-gray-700">
      <div class="flex items-center space-x-3">
        <img src="/pwa-192x192.png" alt="RiseRoll" class="w-8 h-8 sm:w-10 sm:h-10 rounded-lg" />
        <h1 class="text-xl sm:text-2xl font-bold text-white">RiseRoll</h1>
      </div>
      <div class="flex items-center space-x-2">
        <!-- Theme Toggle -->
        <button
          @click="toggleTheme"
          class="p-2 rounded-lg bg-gray-700 dark:bg-gray-600 hover:bg-gray-600 dark:hover:bg-gray-500 transition-colors"
          :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
        >
          <SunIcon v-if="isDark" class="w-5 h-5 text-yellow-400" />
          <MoonIcon v-else class="w-5 h-5 text-blue-300" />
        </button>
        
        <!-- Navigation -->
        <div class="flex space-x-1">
          <button class="px-3 sm:px-4 py-1 sm:py-2 text-sm sm:text-base font-medium text-white border-b-2 border-yellow-400">
            Pick
          </button>
          <router-link to="/activities" class="px-3 sm:px-4 py-1 sm:py-2 text-sm sm:text-base font-medium text-gray-300 hover:text-white transition-colors">
            Manage
          </router-link>
        </div>
      </div>
    </div>

    <div class="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div class="max-w-2xl mx-auto">
        <!-- Main Activity Card -->
        <div class="bg-[#F5F5DC] dark:bg-gray-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 mb-8 transition-colors">
          <h2 class="text-lg sm:text-xl font-medium text-gray-800 dark:text-white mb-6">Today's activity</h2>
          
          <div v-if="selectedActivity" class="text-center mb-8">
            <h3 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1A2B4D] dark:text-blue-400 mb-6">
              {{ selectedActivity }}
            </h3>
          </div>
          <div v-else class="text-center mb-8">
            <h3 class="text-2xl sm:text-3xl font-semibold text-gray-600 dark:text-gray-300">
              Ready to pick your activity?
            </h3>
          </div>

          <!-- Action Buttons -->
          <div class="space-y-3 sm:space-y-4 mb-6">
            <button
              v-if="!selectedActivity"
              @click="pickActivity"
              :disabled="!hasActivities || isLoading"
              class="w-full bg-[#1A2B4D] dark:bg-blue-600 text-white font-medium py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl text-base sm:text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2a3f5f] dark:hover:bg-blue-700 transition-colors"
            >
              <LoadingSpinner v-if="isLoading" size="sm" class="mr-2" />
              Pick activity
            </button>
            
            <button
              v-if="selectedActivity"
              @click="reroll"
              :disabled="!canReroll || isLoading"
              class="w-full bg-orange-500 text-white font-medium py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl text-base sm:text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-600 transition-colors"
            >
              <LoadingSpinner v-if="isLoading" size="sm" class="mr-2" />
              Re-roll ({{ rerollsLeft }} left)
            </button>
          </div>

          <!-- Status Info -->
          <div class="text-center text-sm sm:text-base text-gray-600 dark:text-gray-300">
            <p>{{ timeUntilReset }}</p>
            <p v-if="!hasActivities" class="text-red-500 dark:text-red-400 mt-2">
              Add some activities first!
            </p>
          </div>
        </div>

      <!-- History Section -->
      <div v-if="history && history.length > 0">
        <h3 class="text-2xl sm:text-3xl font-bold text-white mb-6">History</h3>
        <div class="space-y-3">
          <div
            v-for="(entry, index) in history"
            :key="index"
            class="flex justify-between items-center py-4 px-4 sm:px-6 bg-gray-700 dark:bg-gray-800 rounded-lg sm:rounded-xl hover:bg-gray-600 dark:hover:bg-gray-700 transition-colors"
          >
            <span class="text-white text-base sm:text-lg">{{ entry.activity }}</span>
            <span class="text-sm sm:text-base text-gray-300 dark:text-gray-400">
              {{ formatTime(entry.date) }}
            </span>
          </div>
        </div>
      </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useActivityStore } from '../stores/activityStore'
import { useThemeStore } from '../stores/themeStore'
import { useNotificationStore } from '../stores/notificationStore'
import { useLiveActivities, useLiveHistory } from '../composables/useLiveData'
import { SunIcon, MoonIcon } from '@heroicons/vue/24/outline'
import LoadingSpinner from '../components/LoadingSpinner.vue'

const store = useActivityStore()
const themeStore = useThemeStore()
const notificationStore = useNotificationStore()

const { 
  pickActivity: storePickActivity,
  reroll: storeReroll,
  load
} = store

// Reactive data from database
const activities = useLiveActivities()
const history = useLiveHistory()

// Use store state directly instead of reactive database data
const selectedActivity = computed(() => store.selectedActivity)
const rerollsLeft = computed(() => store.rerollsLeft)
const lastRollDate = computed(() => store.lastRollDate)
const isDark = computed(() => themeStore.isDark)

// Loading state
const isLoading = ref(false)

// Mobile keyboard detection
const isKeyboardOpen = ref(false)

// Detect mobile keyboard
const detectKeyboard = () => {
  if (window.visualViewport) {
    const initialHeight = window.visualViewport.height
    const currentHeight = window.visualViewport.height
    const heightDifference = initialHeight - currentHeight
    
    // If height difference is significant, keyboard is likely open
    isKeyboardOpen.value = heightDifference > 150
  }
}

// Listen for viewport changes
onMounted(() => {
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', detectKeyboard)
  }
})

onUnmounted(() => {
  if (window.visualViewport) {
    window.visualViewport.removeEventListener('resize', detectKeyboard)
  }
})

const timeUntilReset = computed(() => {
  if (!lastRollDate.value) return 'Ready to roll!'
  
  const now = new Date()
  const lastRoll = new Date(lastRollDate.value)
  const tomorrow = new Date(lastRoll)
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)
  
  const diff = tomorrow - now
  
  if (diff <= 0) return 'Ready to roll!'
  
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  return `Resets in ${hours}h ${minutes}m`
})

const canReroll = computed(() => rerollsLeft.value > 0)
const hasActivities = computed(() => activities.value && activities.value.length > 0)

const pickActivity = async () => {
  try {
    isLoading.value = true
    await storePickActivity()
  } catch (error) {
    console.error('Error picking activity:', error)
  } finally {
    isLoading.value = false
  }
}

const reroll = async () => {
  try {
    isLoading.value = true
    await storeReroll()
  } catch (error) {
    console.error('Error re-rolling:', error)
  } finally {
    isLoading.value = false
  }
}

const toggleTheme = async () => {
  await themeStore.toggleTheme()
}

const formatTime = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) { // Less than 1 minute
    return 'Just now'
  } else if (diff < 3600000) { // Less than 1 hour
    const minutes = Math.floor(diff / 60000)
    return `${minutes}m ago`
  } else if (diff < 86400000) { // Less than 1 day
    const hours = Math.floor(diff / 3600000)
    return `${hours}h ago`
  } else {
    return date.toLocaleDateString()
  }
}

onMounted(() => {
  load()
})
</script>
