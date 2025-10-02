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
                accept=".csv,.txt"
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
import Papa from 'papaparse'

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

// Security validation for CSV files
const validateCsvFile = (file) => {
  const errors = []
  
  // Check file extension
  const allowedExtensions = ['.csv', '.txt']
  const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
  if (!allowedExtensions.includes(fileExtension)) {
    errors.push(`Invalid file extension. Only ${allowedExtensions.join(', ')} files are allowed.`)
  }
  
  // Check MIME type
  const allowedMimeTypes = [
    'text/csv',
    'text/plain',
    'application/csv',
    'application/vnd.ms-excel'
  ]
  if (!allowedMimeTypes.includes(file.type) && file.type !== '') {
    errors.push(`Invalid file type. Expected CSV file, got: ${file.type}`)
  }
  
  // Check file size (max 1MB)
  const maxSize = 1024 * 1024 // 1MB
  if (file.size > maxSize) {
    errors.push(`File too large. Maximum size is ${maxSize / 1024 / 1024}MB.`)
  }
  
  // Check for suspicious file names
  const suspiciousPatterns = [
    /\.(exe|bat|cmd|scr|pif|com|vbs|js|jar|app|deb|pkg|dmg)$/i,
    /[<>:"|?*]/,
    /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i
  ]
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(file.name)) {
      errors.push('Suspicious file name detected.')
      break
    }
  }
  
  return errors
}

// Sanitize and validate activity content
const sanitizeActivity = (activity) => {
  if (typeof activity !== 'string') return null
  
  // Remove potentially dangerous characters and scripts
  let sanitized = activity
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/data:/gi, '') // Remove data: protocols
    .replace(/vbscript:/gi, '') // Remove vbscript: protocols
    .trim()
  
  // Validate length
  if (sanitized.length === 0) return null
  if (sanitized.length > 200) return null // Max 200 characters
  
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /eval\s*\(/i,
    /function\s*\(/i,
    /setTimeout\s*\(/i,
    /setInterval\s*\(/i,
    /document\./i,
    /window\./i,
    /alert\s*\(/i,
    /confirm\s*\(/i,
    /prompt\s*\(/i
  ]
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(sanitized)) {
      return null // Reject suspicious content
    }
  }
  
  return sanitized
}

const handleCsvImport = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  try {
    isLoading.value = true
    
    // Validate file security
    const validationErrors = validateCsvFile(file)
    if (validationErrors.length > 0) {
      notificationStore.error(`File validation failed: ${validationErrors.join(' ')}`, 3000)
      event.target.value = ''
      return
    }
    
    // Use Papa Parse for secure CSV parsing
    Papa.parse(file, {
      header: false,
      skipEmptyLines: true,
      transformHeader: false,
      transform: (value) => {
        // Additional security: limit field length during parsing
        return typeof value === 'string' ? value.substring(0, 250) : value
      },
      complete: async (results) => {
        try {
          if (results.errors && results.errors.length > 0) {
            console.warn('CSV parsing warnings:', results.errors)
            // Only show error if it's critical
            const criticalErrors = results.errors.filter(error => error.type === 'Delimiter')
            if (criticalErrors.length > 0) {
              notificationStore.error('Invalid CSV format detected.', 2000)
              return
            }
          }
          
          let importedCount = 0
          let duplicateCount = 0
          let rejectedCount = 0
          
          // Limit number of rows to prevent DoS
          const maxRows = 1000
          const rowsToProcess = results.data.slice(0, maxRows)
          
          if (results.data.length > maxRows) {
            notificationStore.info(`File contains ${results.data.length} rows. Only processing first ${maxRows} rows.`, 3000)
          }
          
          for (const row of rowsToProcess) {
            // Handle both single column and multi-column CSV
            const activityText = Array.isArray(row) ? row[0] : row
            const sanitizedActivity = sanitizeActivity(activityText)
            
            if (sanitizedActivity) {
              const success = await storeAddActivity(sanitizedActivity)
              if (success) {
                importedCount++
              } else {
                duplicateCount++
              }
            } else {
              rejectedCount++
            }
          }
          
          // Show results
          if (importedCount > 0) {
            let message = `Successfully imported ${importedCount} activities!`
            if (duplicateCount > 0) {
              message += ` (${duplicateCount} duplicates skipped)`
            }
            if (rejectedCount > 0) {
              message += ` (${rejectedCount} invalid entries rejected)`
            }
            notificationStore.success(message, 3000)
          } else if (duplicateCount > 0) {
            notificationStore.info(`All ${duplicateCount} activities were duplicates and skipped.`, 2000)
          } else if (rejectedCount > 0) {
            notificationStore.error(`All ${rejectedCount} entries were invalid and rejected.`, 2000)
          } else {
            notificationStore.info('No valid activities found in CSV file.', 2000)
          }
          
        } catch (error) {
          console.error('Error processing CSV data:', error)
          notificationStore.error('Error processing CSV data.', 2000)
        }
      },
      error: (error) => {
        console.error('Papa Parse error:', error)
        notificationStore.error('Failed to parse CSV file. Please check the format.', 2000)
      }
    })
    
    // Reset file input
    event.target.value = ''
    
  } catch (error) {
    console.error('Error importing CSV:', error)
    notificationStore.error('Error importing CSV file. Please try again.', 2000)
    event.target.value = ''
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
