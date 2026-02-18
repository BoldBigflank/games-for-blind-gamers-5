<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useWebsocketStore } from './stores/websocketStore'
import { isEmpty } from './utils'

const websocketStore = useWebsocketStore()
const joinRoom = (roomId) => {
  console.log('[Lobby] Joining room:', roomId)
  websocketStore.subscribe(`room:${roomId}`)
}
const createRoom = () => {
  console.log('[Lobby] Creating room')
  const roomId = crypto.randomUUID()
  websocketStore.subscribe(`room:${roomId}`)
}
</script>

<template>
    <div v-if="isEmpty(websocketStore.roomBlob)">
        <h1>Lobby</h1>
        <div id="rooms-list">
          <ul>
            <li v-for="room in websocketStore.rooms" :key="room.id">
              {{ room.name }}
              <button @click="joinRoom(room.id)">Join</button>
            </li>
          </ul>
        </div>
        <button @click="createRoom">Create Room</button>
    </div>
</template>