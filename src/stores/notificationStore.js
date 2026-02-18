import { defineStore } from 'pinia'

export const useNotificationStore = defineStore('notificationStore', {
  state: () => ({
    notifications: [],
  }),
  actions: {
    addNotification(message) {
      this.notifications.push(message)
    },
  },
})
