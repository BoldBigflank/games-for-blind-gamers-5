<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useNotificationStore } from './stores/notificationStore'
import Lobby from './Lobby.vue'

const ws = ref(null)
const isConnected = ref(false)
const retryInterval = 3000
let retryTimeout = null

const notificationStore = useNotificationStore()

const connectWebSocket = () => {
  ws.value = new WebSocket(`ws://localhost:3000?userId=${localStorage.getItem('user_id')}`)
  ws.value.onopen = () => {
    console.log('[App] WebSocket connected')
    isConnected.value = true
    if (retryTimeout) {
      clearTimeout(retryTimeout)
      retryTimeout = null
    }
  }

  ws.value.onmessage = (event) => {
    console.log('[App] WebSocket message:', event.data)
    notificationStore.addNotification(event.data)
  }
  ws.value.onerror = (error) => {
    console.error('[App] WebSocket error:', error)
    isConnected.value = false
  }

  ws.value.onclose = () => {
    console.log('[App] WebSocket closed')
    isConnected.value = false
    attemptReconnect()
  }
}

const attemptReconnect = () => {
  console.log('[App] Attempting to reconnect...')
  if (isConnected.value) return
  // if (retryTimeout) return
  retryTimeout = setTimeout(connectWebSocket, retryInterval)
}

onMounted(() => {
  connectWebSocket()
})

onUnmounted(() => {
  if (ws.value) {
    ws.value.close()
  }
  if (retryTimeout) {
    clearTimeout(retryTimeout)
    retryTimeout = null
  }
})

</script>

<template>
  <h1>Games for Blind Gamers 5</h1>
  <p>
    Visit <a href="https://vuejs.org/" target="_blank" rel="noopener">vuejs.org</a> to read the
    documentation
  </p>
  <div id="notifications">
    <ul>
      <li v-for="notification in notificationStore.notifications" :key="notification">
        {{ notification }}
      </li>
    </ul>
  </div>
  <Lobby />
</template>

<style scoped></style>
