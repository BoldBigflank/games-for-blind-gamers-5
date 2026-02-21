import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useWebSocket } from '@vueuse/core'

export const useWebsocketStore = defineStore('websocketStore', () => {
  const connectionStatus = ref('disconnected')
  const rooms = ref([])
  const roomMessages = ref([])
  const userBlob = ref({})
  const roomBlob = ref({})
  const { status, data, send, open, close, ws } = useWebSocket(
    `ws://localhost:3000?userId=${localStorage.getItem('user_id')}&userName=${localStorage.getItem('user_name')}`,
    {
      autoReconnect: true,
      onConnected: (ws) => {
        console.log('[WebsocketStore] Connected to server')
        connectionStatus.value = 'connected'
      },
      onDisconnected: (ws, event) => {
        console.log('[WebsocketStore] Disconnected from server', event.code)
        connectionStatus.value = 'disconnected'
      },
      onError: (ws, event) => {
        console.error('[WebsocketStore] Error:', event)
        connectionStatus.value = 'error'
      },
      onMessage: (ws, event) => {
        console.log('[WebsocketStore] Message received:', event.data)
        const { channel, data } = JSON.parse(event.data)
        if (channel === 'rooms') {
          rooms.value = data
        }
        if (channel.startsWith('user:')) {
          const userId = channel.split(':')[1]
          localStorage.setItem('user_id', userId)
          userBlob.value = data
        }
        if (channel.startsWith('room:')) {
          roomBlob.value = data
          roomMessages.value = data.messages
        }
      },
    }
  )
  const action = (channel, data) => {
    send(JSON.stringify({ type: 'action', channel, data }))
  }
  const publish = (channel, data) => {
    send(JSON.stringify({ type: 'publish', channel, data }))
  }
  const subscribe = (channel) => {
    send(JSON.stringify({ type: 'subscribe', channel }))
  }
  const unsubscribe = (channel) => {
    send(JSON.stringify({ type: 'unsubscribe', channel }))
  }
  return {
    connectionStatus,
    status,
    data,
    send,
    open,
    close,
    ws,
    rooms,
    userBlob,
    roomBlob,
    roomMessages,
    publish,
    subscribe,
    unsubscribe,
    action,
  }
})
