import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useWebSocket } from '@vueuse/core'

export const useWebsocketStore = defineStore('websocketStore', () => {
  const rooms = ref([])
  const userBlob = ref({})
  const roomBlob = ref({})
  const { status, data, send, open, close, ws } = useWebSocket(
    `ws://localhost:3000?userId=${localStorage.getItem('user_id')}`,
    {
      onConnected: (ws) => {
        console.log('[WebsocketStore] Connected to server')
      },
      onDisconnected: (ws, event) => {
        console.log('[WebsocketStore] Disconnected from server', event.code)
      },
      onError: (ws, event) => {
        console.error('[WebsocketStore] Error:', event)
      },
      onMessage: (ws, event) => {
        console.log('[WebsocketStore] Message received:', event.data)
        const { channel, data } = JSON.parse(event.data)
        if (channel === 'rooms') {
          rooms.value = data
        }
        if (channel.startsWith('user:')) {
          userBlob.value = data
        }
        if (channel.startsWith('room:')) {
          roomBlob.value = data
        }
      },
    }
  )
  const publish = (channel, data) => {
    send(JSON.stringify({ type: 'publish', channel, data }))
  }
  const subscribe = (channel) => {
    send(JSON.stringify({ type: 'subscribe', channel }))
  }
  const unsubscribe = (channel) => {
    send(JSON.stringify({ type: 'unsubscribe', channel }))
  }
  return { status, data, send, open, close, ws, rooms, userBlob, roomBlob, publish, subscribe, unsubscribe }
})
