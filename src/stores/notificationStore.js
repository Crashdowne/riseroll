import { defineStore } from 'pinia'

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    notifications: []
  }),

  actions: {
    addNotification(notification) {
      const id = Date.now() + Math.random()
      const newNotification = {
        id,
        type: 'info', // success, error, warning, info
        title: '',
        message: '',
        duration: 5000,
        ...notification
      }
      
      this.notifications.push(newNotification)
      
      // Auto remove after duration
      if (newNotification.duration > 0) {
        setTimeout(() => {
          this.removeNotification(id)
        }, newNotification.duration)
      }
      
      return id
    },

    removeNotification(id) {
      this.notifications = this.notifications.filter(n => n.id !== id)
    },

    clearAll() {
      this.notifications = []
    },

    // Convenience methods
    success(message, duration = 3000) {
      return this.addNotification({ type: 'success', message, duration })
    },

    error(message, duration = 5000) {
      return this.addNotification({ type: 'error', message, duration })
    },

    warning(message, duration = 3000) {
      return this.addNotification({ type: 'warning', message, duration })
    },

    info(message, duration = 3000) {
      return this.addNotification({ type: 'info', message, duration })
    }
  }
})
