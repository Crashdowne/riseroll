import { defineStore } from 'pinia'
import { db } from '../db.js'

export const useActivityStore = defineStore('activity', {
  state: () => ({
    activities: [],
    selectedActivity: null,
    rerollsLeft: 2,
    lastRollDate: null,
    history: [],
    recentlyDeleted: null,
    isLockedIn: false
  }),

  getters: {
    timeUntilReset: (state) => {
      if (!state.lastRollDate) return 'Ready to roll!'
      
      const now = new Date()
      const lastRoll = new Date(state.lastRollDate)
      const resetTime = new Date(lastRoll)
      resetTime.setDate(resetTime.getDate() + 1)
      resetTime.setHours(0, 1, 0, 0) // 12:01am
      
      const diff = resetTime - now
      
      if (diff <= 0) return 'Ready to roll!'
      
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      
      return `Resets in ${hours}h ${minutes}m`
    },

    canReroll: (state) => state.rerollsLeft > 0 && !state.isLockedIn,

    hasActivities: (state) => state.activities.length > 0,

    canLockIn: (state) => state.selectedActivity && state.rerollsLeft > 0 && !state.isLockedIn
  },

  actions: {
    async addActivity(activity) {
      if (activity.trim()) {
        try {
          // Check if activity already exists (case-insensitive)
          const trimmedActivity = activity.trim()
          const existing = await db.activities
            .filter(act => act.name.toLowerCase() === trimmedActivity.toLowerCase())
            .first()
          
          if (existing) return false // Return false to indicate duplicate

          // Add to database
          await db.activities.add({
            name: trimmedActivity,
            createdAt: new Date(),
            updatedAt: new Date()
          })

          // Update local state
          await this.loadActivities()
          return true // Return true to indicate success
        } catch (error) {
          console.error('Error adding activity:', error)
          return false
        }
      }
      return false
    },

    async editActivity(id, newValue) {
      if (newValue.trim()) {
        try {
          await db.activities.update(id, {
            name: newValue.trim(),
            updatedAt: new Date()
          })

          // Update local state
          await this.loadActivities()
        } catch (error) {
          console.error('Error editing activity:', error)
        }
      }
    },

    async deleteActivity(id) {
      try {
        // Get the activity before deleting
        const activity = await db.activities.get(id)
        if (activity) {
          this.recentlyDeleted = { 
            activity: activity.name, 
            id: id,
            createdAt: activity.createdAt
          }

          // Delete from database
          await db.activities.delete(id)

          // Update local state
          await this.loadActivities()
        }
      } catch (error) {
        console.error('Error deleting activity:', error)
      }
    },

    async undoDelete() {
      if (this.recentlyDeleted) {
        try {
          await db.activities.add({
            name: this.recentlyDeleted.activity,
            createdAt: this.recentlyDeleted.createdAt,
            updatedAt: new Date()
          })

          this.recentlyDeleted = null
          await this.loadActivities()
        } catch (error) {
          console.error('Error undoing delete:', error)
        }
      }
    },

    async pickActivity() {
      if (this.activities.length === 0) return null
      
      // If already picked and it's still before the 12:01am reset, don't allow another pick
      if (this.lastRollDate) {
        const now = new Date()
        const lastRoll = new Date(this.lastRollDate)
        const resetTime = new Date(lastRoll)
        resetTime.setDate(resetTime.getDate() + 1)
        resetTime.setHours(0, 1, 0, 0) // 12:01am
        
        if (now < resetTime) {
          return this.selectedActivity
        }
      }
      
      // Better randomness using crypto.getRandomValues if available, fallback to Math.random
      let randomIndex
      if (window.crypto && window.crypto.getRandomValues) {
        const array = new Uint32Array(1)
        window.crypto.getRandomValues(array)
        randomIndex = array[0] % this.activities.length
      } else {
        // Enhanced Math.random with multiple samples for better distribution
        randomIndex = Math.floor(Math.random() * this.activities.length)
      }
      
      this.selectedActivity = this.activities[randomIndex].name
      this.lastRollDate = new Date().toISOString()
      this.rerollsLeft = 2 // Start with 2 rerolls after initial pick
      
      await this.logHistory(this.selectedActivity)
      await this.saveSettings()
      
      return this.selectedActivity
    },

    async reroll() {
      if (this.rerollsLeft <= 0 || this.activities.length === 0 || this.isLockedIn) return null
      
      console.log('Before reroll - rerollsLeft:', this.rerollsLeft)
      
      // Better randomness using crypto.getRandomValues if available, fallback to Math.random
      let randomIndex
      if (window.crypto && window.crypto.getRandomValues) {
        const array = new Uint32Array(1)
        window.crypto.getRandomValues(array)
        randomIndex = array[0] % this.activities.length
      } else {
        // Enhanced Math.random with multiple samples for better distribution
        randomIndex = Math.floor(Math.random() * this.activities.length)
      }
      
      this.selectedActivity = this.activities[randomIndex].name
      this.rerollsLeft--
      
      console.log('After reroll - rerollsLeft:', this.rerollsLeft)
      
      await this.logHistory(this.selectedActivity)
      await this.saveSettings()
      
      return this.selectedActivity
    },

    async lockIn() {
      if (!this.selectedActivity || this.rerollsLeft <= 0 || this.isLockedIn) return false
      
      this.isLockedIn = true
      await this.saveSettings()
      
      return true
    },

    checkReset() {
      if (!this.lastRollDate) return
      
      const now = new Date()
      const lastRoll = new Date(this.lastRollDate)
      
      // Calculate 12:01am of the day after the last roll
      const resetTime = new Date(lastRoll)
      resetTime.setDate(resetTime.getDate() + 1)
      resetTime.setHours(0, 1, 0, 0) // 12:01am
      
      if (now >= resetTime) {
        this.rerollsLeft = 2
        this.selectedActivity = null
        this.lastRollDate = null
        this.isLockedIn = false
        this.saveSettings()
      }
    },

    async logHistory(activity) {
      try {
        await db.history.add({
          activity: activity,
          timestamp: new Date(),
          date: new Date().toISOString().split('T')[0]
        })

        // Keep only last 10 entries
        const allHistory = await db.history.orderBy('timestamp').reverse().toArray()
        if (allHistory.length > 10) {
          const toDelete = allHistory.slice(10)
          await db.history.bulkDelete(toDelete.map(h => h.id))
        }

        await this.loadHistory()
      } catch (error) {
        console.error('Error logging history:', error)
      }
    },


    async loadActivities() {
      try {
        this.activities = await db.activities.orderBy('createdAt').toArray()
      } catch (error) {
        console.error('Error loading activities:', error)
      }
    },

    async loadHistory() {
      try {
        const historyEntries = await db.history.orderBy('timestamp').reverse().limit(10).toArray()
        this.history = historyEntries.map(entry => ({
          date: entry.timestamp.toISOString(),
          activity: entry.activity
        }))
      } catch (error) {
        console.error('Error loading history:', error)
      }
    },

    async loadSettings() {
      try {
        console.log('Loading settings from database...')
        
        // Check if database has any settings at all
        const allSettings = await db.settings.toArray()
        console.log('All settings in database:', allSettings)
        
        const selectedActivitySetting = await db.settings.where('key').equals('selectedActivity').first()
        const rerollsLeftSetting = await db.settings.where('key').equals('rerollsLeft').first()
        const lastRollDateSetting = await db.settings.where('key').equals('lastRollDate').first()
        const isLockedInSetting = await db.settings.where('key').equals('isLockedIn').first()

        console.log('Loaded settings from database:', {
          selectedActivity: selectedActivitySetting?.value,
          rerollsLeft: rerollsLeftSetting?.value,
          lastRollDate: lastRollDateSetting?.value,
          isLockedIn: isLockedInSetting?.value
        })

        console.log('Raw settings data:', {
          selectedActivitySetting,
          rerollsLeftSetting,
          lastRollDateSetting,
          isLockedInSetting
        })

        // Load the values first, treating empty strings as null
        const loadedActivity = selectedActivitySetting?.value && selectedActivitySetting.value !== '' 
          ? selectedActivitySetting.value 
          : null
        const loadedRerolls = rerollsLeftSetting?.value 
          ? parseInt(rerollsLeftSetting.value) 
          : 2
        const loadedLastRoll = lastRollDateSetting?.value && lastRollDateSetting.value !== '' 
          ? lastRollDateSetting.value 
          : null
        const loadedIsLockedIn = isLockedInSetting?.value === 'true'

        // Check if we need to reset (new day - after 12:01am)
        if (loadedLastRoll) {
          const lastRoll = new Date(loadedLastRoll)
          const now = new Date()
          
          // Calculate 12:01am of the day after the last roll
          const resetTime = new Date(lastRoll)
          resetTime.setDate(resetTime.getDate() + 1)
          resetTime.setHours(0, 1, 0, 0) // 12:01am
          
          if (now >= resetTime) {
            // It's past 12:01am of the next day, reset everything
            this.selectedActivity = null
            this.rerollsLeft = 2
            this.lastRollDate = null
            this.isLockedIn = false
            await this.saveSettings()
            return
          }
        }

        // Same day or no previous roll, keep the loaded values
        this.selectedActivity = loadedActivity
        this.rerollsLeft = loadedRerolls
        this.lastRollDate = loadedLastRoll
        this.isLockedIn = loadedIsLockedIn

        console.log('Final loaded state:', {
          selectedActivity: this.selectedActivity,
          rerollsLeft: this.rerollsLeft,
          lastRollDate: this.lastRollDate,
          isLockedIn: this.isLockedIn
        })
      } catch (error) {
        console.error('Error loading settings:', error)
      }
    },

    async saveSettings() {
      try {
        console.log('Saving settings to database...', {
          selectedActivity: this.selectedActivity,
          rerollsLeft: this.rerollsLeft,
          lastRollDate: this.lastRollDate,
          isLockedIn: this.isLockedIn
        })

        // Better upsert pattern - check if exists first, then update or add
        let selectedActivitySetting = await db.settings.where('key').equals('selectedActivity').first()
        if (selectedActivitySetting) {
          await db.settings.update(selectedActivitySetting.id, {
            value: this.selectedActivity || '',
            updatedAt: new Date()
          })
          console.log('Updated selectedActivity setting')
        } else {
          await db.settings.add({
            key: 'selectedActivity',
            value: this.selectedActivity || '',
            updatedAt: new Date()
          })
          console.log('Added new selectedActivity setting')
        }

        let rerollsLeftSetting = await db.settings.where('key').equals('rerollsLeft').first()
        if (rerollsLeftSetting) {
          await db.settings.update(rerollsLeftSetting.id, {
            value: this.rerollsLeft.toString(),
            updatedAt: new Date()
          })
          console.log('Updated rerollsLeft setting')
        } else {
          await db.settings.add({
            key: 'rerollsLeft',
            value: this.rerollsLeft.toString(),
            updatedAt: new Date()
          })
          console.log('Added new rerollsLeft setting')
        }

        let lastRollDateSetting = await db.settings.where('key').equals('lastRollDate').first()
        if (lastRollDateSetting) {
          await db.settings.update(lastRollDateSetting.id, {
            value: this.lastRollDate || '',
            updatedAt: new Date()
          })
          console.log('Updated lastRollDate setting')
        } else {
          await db.settings.add({
            key: 'lastRollDate',
            value: this.lastRollDate || '',
            updatedAt: new Date()
          })
          console.log('Added new lastRollDate setting')
        }

        let isLockedInSetting = await db.settings.where('key').equals('isLockedIn').first()
        if (isLockedInSetting) {
          await db.settings.update(isLockedInSetting.id, {
            value: this.isLockedIn.toString(),
            updatedAt: new Date()
          })
          console.log('Updated isLockedIn setting')
        } else {
          await db.settings.add({
            key: 'isLockedIn',
            value: this.isLockedIn.toString(),
            updatedAt: new Date()
          })
          console.log('Added new isLockedIn setting')
        }

        console.log('Settings saved successfully to database')
        
        // Verify the data was actually saved
        const verification = await db.settings.toArray()
        console.log('Verification - all settings in database:', verification)
        
      } catch (error) {
        console.error('Error saving settings:', error)
      }
    },

    async resetCount() {
      this.rerollsLeft = 2
      this.selectedActivity = null
      this.lastRollDate = null
      this.isLockedIn = false
      await this.saveSettings()
    },

    async load() {
      try {
        console.log('Starting to load app state...')
        
        // Load all data
        await this.loadActivities()
        await this.loadHistory()
        await this.loadSettings()
        
        console.log('App state loaded successfully from database')
        console.log('Current store state after loading:', {
          selectedActivity: this.selectedActivity,
          rerollsLeft: this.rerollsLeft,
          lastRollDate: this.lastRollDate,
          isLockedIn: this.isLockedIn,
          activitiesCount: this.activities.length
        })
      } catch (error) {
        console.error('Error loading app state:', error)
        console.log('Falling back to default state')
        
        // Fallback to default state if loading fails
        this.activities = []
        this.selectedActivity = null
        this.rerollsLeft = 2
        this.lastRollDate = null
        this.history = []
        this.recentlyDeleted = null
        this.isLockedIn = false
      }
    },

    // Debug method to test database functionality
    async debugDatabase() {
      console.log('=== DATABASE DEBUG ===')
      try {
        // Test database connection
        console.log('Database name:', db.name)
        console.log('Database version:', db.verno)
        console.log('Database is open:', db.isOpen())
        
        const activities = await db.activities.toArray()
        const settings = await db.settings.toArray()
        const history = await db.history.toArray()
        
        console.log('Activities:', activities)
        console.log('Settings:', settings)
        console.log('History:', history)
        
        return { activities, settings, history }
      } catch (error) {
        console.error('Database debug error:', error)
        return null
      }
    },

    // Test method to manually save and load data
    async testPersistence() {
      console.log('=== TESTING PERSISTENCE ===')
      try {
        // Save test data
        this.selectedActivity = 'Test Activity'
        this.rerollsLeft = 1
        this.lastRollDate = new Date().toISOString()
        this.isLockedIn = true
        
        console.log('Before save:', {
          selectedActivity: this.selectedActivity,
          rerollsLeft: this.rerollsLeft,
          lastRollDate: this.lastRollDate,
          isLockedIn: this.isLockedIn
        })
        
        await this.saveSettings()
        
        // Clear state
        this.selectedActivity = null
        this.rerollsLeft = 2
        this.lastRollDate = null
        this.isLockedIn = false
        
        console.log('After clearing:', {
          selectedActivity: this.selectedActivity,
          rerollsLeft: this.rerollsLeft,
          lastRollDate: this.lastRollDate,
          isLockedIn: this.isLockedIn
        })
        
        // Load from database
        await this.loadSettings()
        
        console.log('After loading:', {
          selectedActivity: this.selectedActivity,
          rerollsLeft: this.rerollsLeft,
          lastRollDate: this.lastRollDate,
          isLockedIn: this.isLockedIn
        })
        
        return 'Test completed - check console logs'
      } catch (error) {
        console.error('Persistence test error:', error)
        return 'Test failed'
      }
    }
  }
})
