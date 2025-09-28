import { defineStore } from 'pinia'
import { db } from '../db.js'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    isDark: false,
    isLoading: false
  }),

  actions: {
    async toggleTheme() {
      this.isDark = !this.isDark
      this.updateDocumentClass()
      await this.saveTheme()
    },

    async loadTheme() {
      try {
        const themeSetting = await db.settings.where('key').equals('theme').first()
        this.isDark = themeSetting?.value === 'dark'
        this.updateDocumentClass()
      } catch (error) {
        console.error('Error loading theme:', error)
        // Default to light mode
        this.isDark = false
        this.updateDocumentClass()
      }
    },

    async saveTheme() {
      try {
        await db.settings.where('key').equals('theme').modify({
          value: this.isDark ? 'dark' : 'light',
          updatedAt: new Date()
        })
        .catch(async () => {
          await db.settings.add({
            key: 'theme',
            value: this.isDark ? 'dark' : 'light',
            updatedAt: new Date()
          })
        })
      } catch (error) {
        console.error('Error saving theme:', error)
      }
    },

    updateDocumentClass() {
      if (this.isDark) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }
})
