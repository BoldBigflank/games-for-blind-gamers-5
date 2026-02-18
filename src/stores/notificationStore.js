import { defineStore } from 'pinia'
import { useWebsocketStore } from './websocketStore'

export const useNotificationStore = defineStore('notificationStore', {
  state: () => ({
    notifications: [],
    userId: null,
    roomId: null,
    rooms: [],
    userBlob: null,
    roomBlob: null,
  }),
  actions: {
    subscribe(channel) {
      console.log('[NotificationStore] Subscribing to channel:', channel)
      this.ws.send(JSON.stringify({ type: 'subscribe', channel }))
    },
    unsubscribe(channel) {
      console.log('[NotificationStore] Unsubscribing from channel:', channel)
      this.ws.send(JSON.stringify({ type: 'unsubscribe', channel }))
    },
    addNotification(message) {
      this.notifications.push(message)
      const { channel, data } = JSON.parse(message)
      if (channel === 'rooms') {
        this.rooms = data
      }
      if (channel.startsWith('user:')) {
        this.userId = channel.split(':')[1]
        localStorage.setItem('user_id', this.userId)
        this.userBlob = data
      }
      if (channel.startsWith('room:')) {
        this.roomId = channel.split(':')[1]
        localStorage.setItem('room_id', this.roomId)
        this.roomBlob = data
      }
    },
  },
})
