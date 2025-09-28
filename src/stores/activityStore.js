import { defineStore } from 'pinia'
import { db } from '../db.js'

export const useActivityStore = defineStore('activity', {
  state: () => ({
    activities: [],
    selectedActivity: null,
    rerollsLeft: 2,
    lastRollDate: null,
    history: [],
    recentlyDeleted: null
  }),

  getters: {
    timeUntilReset: (state) => {
      if (!state.lastRollDate) return 'Ready to roll!'
      
      const now = new Date()
      const lastRoll = new Date(state.lastRollDate)
      const tomorrow = new Date(lastRoll)
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)
      
      const diff = tomorrow - now
      
      if (diff <= 0) return 'Ready to roll!'
      
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      
      return `Resets in ${hours}h ${minutes}m`
    },

    canReroll: (state) => state.rerollsLeft > 0,

    hasActivities: (state) => state.activities.length > 0
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
      
      this.checkReset()
      
      // If already picked today, don't allow another pick
      if (this.lastRollDate && this.isToday(new Date(this.lastRollDate))) {
        return this.selectedActivity
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
      if (this.rerollsLeft <= 0 || this.activities.length === 0) return null
      
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

    checkReset() {
      if (!this.lastRollDate) return
      
      const now = new Date()
      const lastRoll = new Date(this.lastRollDate)
      
      if (!this.isToday(lastRoll)) {
        this.rerollsLeft = 2
        this.selectedActivity = null
        this.lastRollDate = null
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

    isToday(date) {
      const today = new Date()
      return date.getDate() === today.getDate() &&
             date.getMonth() === today.getMonth() &&
             date.getFullYear() === today.getFullYear()
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
        const selectedActivitySetting = await db.settings.where('key').equals('selectedActivity').first()
        const rerollsLeftSetting = await db.settings.where('key').equals('rerollsLeft').first()
        const lastRollDateSetting = await db.settings.where('key').equals('lastRollDate').first()

        console.log('Loaded settings from database:', {
          selectedActivity: selectedActivitySetting?.value,
          rerollsLeft: rerollsLeftSetting?.value,
          lastRollDate: lastRollDateSetting?.value
        })

        this.selectedActivity = selectedActivitySetting?.value || null
        this.rerollsLeft = parseInt(rerollsLeftSetting?.value) || 2
        this.lastRollDate = lastRollDateSetting?.value || null

        this.checkReset()
      } catch (error) {
        console.error('Error loading settings:', error)
      }
    },

    async saveSettings() {
      try {
        // Use upsert pattern - update if exists, add if not
        await db.settings.where('key').equals('selectedActivity').modify({
          value: this.selectedActivity || '',
          updatedAt: new Date()
        })
        .catch(async () => {
          await db.settings.add({
            key: 'selectedActivity',
            value: this.selectedActivity || '',
            updatedAt: new Date()
          })
        })

        await db.settings.where('key').equals('rerollsLeft').modify({
          value: this.rerollsLeft.toString(),
          updatedAt: new Date()
        })
        .catch(async () => {
          await db.settings.add({
            key: 'rerollsLeft',
            value: this.rerollsLeft.toString(),
            updatedAt: new Date()
          })
        })

        await db.settings.where('key').equals('lastRollDate').modify({
          value: this.lastRollDate || '',
          updatedAt: new Date()
        })
        .catch(async () => {
          await db.settings.add({
            key: 'lastRollDate',
            value: this.lastRollDate || '',
            updatedAt: new Date()
          })
        })
      } catch (error) {
        console.error('Error saving settings:', error)
      }
    },

    async resetCount() {
      this.rerollsLeft = 2
      this.selectedActivity = null
      this.lastRollDate = null
      await this.saveSettings()
    },

    async load() {
      try {
        // Load all data
        await this.loadActivities()
        await this.loadHistory()
        await this.loadSettings()
        
        console.log('App state loaded successfully from database')
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
      }
    }
  }
})
