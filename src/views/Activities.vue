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
          <router-link to="/" class="px-3 sm:px-4 py-1 sm:py-2 text-sm sm:text-base font-medium text-gray-300 hover:text-white transition-colors">
            Pick
          </router-link>
          <button class="px-3 sm:px-4 py-1 sm:py-2 text-sm sm:text-base font-medium text-white border-b-2 border-yellow-400">
            Manage
          </button>
        </div>
      </div>
    </div>

    <div class="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div class="max-w-4xl mx-auto">
        <!-- Add Activity Form -->
        <div class="bg-[#F5F5DC] dark:bg-gray-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 mb-8 transition-colors">
          <h2 class="text-lg sm:text-xl font-medium text-gray-800 dark:text-white mb-6">Add New Activity</h2>
          <form @submit.prevent="addActivity" class="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <input
              v-model="newActivity"
              type="text"
              placeholder="Enter a new activity..."
              class="flex-1 px-4 py-3 sm:py-4 border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#1A2B4D] dark:focus:ring-blue-500 focus:border-transparent text-gray-800 dark:text-white dark:bg-gray-700 text-base sm:text-lg"
              maxlength="100"
              :disabled="isLoading"
              autocomplete="off"
              autocorrect="off"
              autocapitalize="off"
              spellcheck="false"
            />
            <button
              type="submit"
              :disabled="!newActivity.trim() || isLoading"
              class="bg-[#1A2B4D] dark:bg-blue-600 text-white font-medium py-3 sm:py-4 px-6 sm:px-8 rounded-lg sm:rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2a3f5f] dark:hover:bg-blue-700 transition-colors text-base sm:text-lg"
            >
              <LoadingSpinner v-if="isLoading" size="sm" class="mr-2" />
              Add
            </button>
          </form>
        </div>

        <!-- Activities List -->
        <div class="bg-[#F5F5DC] dark:bg-gray-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 transition-colors">
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
          <h2 class="text-lg sm:text-xl font-medium text-gray-800 dark:text-white mb-2 sm:mb-0">
            Your Activities ({{ activities ? activities.length : 0 }})
          </h2>
          <div class="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <button
              v-if="recentlyDeleted"
              @click="undoDelete"
              class="text-sm sm:text-base text-[#1A2B4D] dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              Undo delete
            </button>
            <div class="flex gap-2">
              <input
                ref="csvFileInput"
                type="file"
                accept=".csv"
                @change="handleCsvImport"
                class="hidden"
              />
              <button
                @click="triggerCsvImport"
                :disabled="isLoading"
                class="text-sm sm:text-base text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors px-3 py-1 rounded hover:bg-green-50 dark:hover:bg-green-900/20 disabled:opacity-50"
              >
                Import CSV
              </button>
              <button
                @click="showResetConfirmation"
                :disabled="isLoading"
                class="text-sm sm:text-base text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors px-3 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
              >
                Reset Rolls
              </button>
            </div>
          </div>
        </div>

          <div v-if="!activities || activities.length === 0" class="text-center py-12">
            <div class="text-6xl mb-6">📝</div>
            <p class="text-gray-600 dark:text-gray-300 text-base sm:text-lg">
              No activities yet. Add your first one above!
            </p>
          </div>

          <div v-else class="space-y-4 max-h-96 sm:max-h-[500px] overflow-y-auto pr-2 activities-scroll">
            <div
              v-for="activity in activities"
              :key="activity.id"
              class="flex items-center gap-4 p-4 sm:p-6 bg-white dark:bg-gray-700 rounded-lg sm:rounded-xl group hover:shadow-md dark:hover:shadow-lg transition-shadow"
            >
              <div v-if="editingIndex === activity.id" class="flex-1 flex flex-col sm:flex-row gap-3">
                <input
                  v-model="editingValue"
                  @keyup.enter="saveEdit(activity.id)"
                  @keyup.escape="cancelEdit"
                  class="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#1A2B4D] dark:focus:ring-blue-500 focus:border-transparent text-gray-800 dark:text-white dark:bg-gray-600 text-base"
                  ref="editInput"
                  :disabled="isLoading"
                  autocomplete="off"
                  autocorrect="off"
                  autocapitalize="off"
                  spellcheck="false"
                />
                <div class="flex gap-2">
                  <button
                    @click="saveEdit(activity.id)"
                    :disabled="isLoading"
                    class="bg-[#1A2B4D] dark:bg-blue-600 text-white text-sm sm:text-base px-4 py-2 rounded-lg hover:bg-[#2a3f5f] dark:hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <LoadingSpinner v-if="isLoading" size="sm" class="mr-1" />
                    Save
                  </button>
                  <button
                    @click="cancelEdit"
                    :disabled="isLoading"
                    class="bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white text-sm sm:text-base px-4 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
              <div v-else class="flex-1 flex items-center gap-4">
                <span class="text-gray-800 dark:text-white flex-1 text-base sm:text-lg">
                  {{ activity.name }}
                </span>
                <div class="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                  <button
                    @click="startEdit(activity.id, activity.name)"
                    :disabled="isLoading"
                    class="text-[#1A2B4D] dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm sm:text-base px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                  >
                    Edit
                  </button>
                  <button
                    @click="deleteActivity(activity.id)"
                    :disabled="isLoading"
                    class="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm sm:text-base px-3 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Reset Confirmation Modal -->
    <div v-if="showResetModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-4 transition-colors">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">Reset Daily Count</h3>
        <p class="text-gray-600 dark:text-gray-300 mb-4">
          This will reset your daily re-roll count to 2. Type <strong>CONFIRM</strong> to proceed:
        </p>
        <input
          v-model="resetConfirmationText"
          type="text"
          placeholder="Type CONFIRM here"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-800 dark:text-white dark:bg-gray-700 mb-4"
        />
        <div class="flex gap-3">
          <button
            @click="confirmReset"
            :disabled="resetConfirmationText !== 'CONFIRM'"
            class="bg-red-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-700 transition-colors"
          >
            Reset Rolls
          </button>
          <button
            @click="cancelReset"
            class="bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white px-4 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, onUnmounted, computed } from 'vue'
import { useActivityStore } from '../stores/activityStore'
import { useThemeStore } from '../stores/themeStore'
import { useNotificationStore } from '../stores/notificationStore'
import { useLiveActivities } from '../composables/useLiveData'
import { SunIcon, MoonIcon } from '@heroicons/vue/24/outline'
import LoadingSpinner from '../components/LoadingSpinner.vue'

const store = useActivityStore()
const themeStore = useThemeStore()
const notificationStore = useNotificationStore()

const { 
  recentlyDeleted,
  addActivity: storeAddActivity,
  editActivity: storeEditActivity,
  deleteActivity: storeDeleteActivity,
  undoDelete: storeUndoDelete,
  load
} = store

// Reactive data from database
const activities = useLiveActivities()

// Theme and loading state
const isDark = computed(() => themeStore.isDark)
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

const newActivity = ref('')
const editingIndex = ref(null)
const editingValue = ref('')
const editInput = ref(null)
const csvFileInput = ref(null)
const showResetModal = ref(false)
const resetConfirmationText = ref('')

const addActivity = async () => {
  if (newActivity.value.trim()) {
    try {
      isLoading.value = true
      const success = await storeAddActivity(newActivity.value)
      if (success) {
        newActivity.value = ''
      } else {
        // Duplicate activity - no notification needed as per requirements
        newActivity.value = ''
      }
    } catch (error) {
      console.error('Error adding activity:', error)
    } finally {
      isLoading.value = false
    }
  }
}

const startEdit = async (id, name) => {
  editingIndex.value = id
  editingValue.value = name
  await nextTick()
  if (editInput.value && typeof editInput.value.focus === 'function') {
    editInput.value.focus()
  }
}

const saveEdit = async (id) => {
  if (editingValue.value.trim()) {
    try {
      isLoading.value = true
      await storeEditActivity(id, editingValue.value)
    } catch (error) {
      console.error('Error updating activity:', error)
    } finally {
      isLoading.value = false
    }
  }
  cancelEdit()
}

const cancelEdit = () => {
  editingIndex.value = null
  editingValue.value = ''
}

const deleteActivity = async (id) => {
  try {
    isLoading.value = true
    await storeDeleteActivity(id)
  } catch (error) {
    console.error('Error deleting activity:', error)
  } finally {
    isLoading.value = false
  }
}

const undoDelete = async () => {
  try {
    await storeUndoDelete()
  } catch (error) {
    console.error('Error restoring activity:', error)
  }
}

const triggerCsvImport = () => {
  csvFileInput.value?.click()
}

const handleCsvImport = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  try {
    isLoading.value = true
    const text = await file.text()
    const lines = text.split('\n').filter(line => line.trim())
    
    let importedCount = 0
    let duplicateCount = 0
    
    for (const line of lines) {
      const activity = line.trim().replace(/^["']|["']$/g, '') // Remove quotes
      if (activity) {
        const success = await storeAddActivity(activity)
        if (success) {
          importedCount++
        } else {
          duplicateCount++
        }
      }
    }
    
    if (importedCount > 0) {
      let message = `Successfully imported ${importedCount} activities!`
      if (duplicateCount > 0) {
        message += ` (${duplicateCount} duplicates skipped)`
      }
      notificationStore.success(message, 1000)
    } else if (duplicateCount > 0) {
      notificationStore.info(`All ${duplicateCount} activities were duplicates and skipped.`, 1000)
    } else {
      notificationStore.info('No valid activities found in CSV file.', 1000)
    }
    
    // Reset file input
    event.target.value = ''
  } catch (error) {
    console.error('Error importing CSV:', error)
    notificationStore.error('Error importing CSV file. Please check the format and try again.', 1000)
  } finally {
    isLoading.value = false
  }
}

const showResetConfirmation = () => {
  showResetModal.value = true
  resetConfirmationText.value = ''
}

const cancelReset = () => {
  showResetModal.value = false
  resetConfirmationText.value = ''
}

const confirmReset = async () => {
  if (resetConfirmationText.value === 'CONFIRM') {
    try {
      // Reset the count directly
      store.rerollsLeft = 2
      store.selectedActivity = null
      store.lastRollDate = null
      await store.saveSettings()
      
      showResetModal.value = false
      resetConfirmationText.value = ''
      notificationStore.success('Daily count has been reset to 2!', 1000)
    } catch (error) {
      notificationStore.error('Failed to reset count', 1000)
      console.error('Error resetting count:', error)
    }
  }
}

const toggleTheme = async () => {
  await themeStore.toggleTheme()
}

onMounted(() => {
  load()
  
  // Set up keyboard detection
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', detectKeyboard)
  }
})

onUnmounted(() => {
  if (window.visualViewport) {
    window.visualViewport.removeEventListener('resize', detectKeyboard)
  }
})
</script>
