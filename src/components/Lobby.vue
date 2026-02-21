<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useWebsocketStore } from '@/stores/websocketStore'
import { isEmpty } from '@/utils'

const websocketStore = useWebsocketStore()
const joinRoom = (roomId) => {
  websocketStore.subscribe(`room:${roomId}`)
}
const createRoom = () => {
  const roomId = crypto.randomUUID()
  websocketStore.subscribe(`room:${roomId}`)
}
</script>

<template>
    <div v-if="isEmpty(websocketStore.roomBlob)">
        <h1>Lobby</h1>
        <div class="flex flex-col items-center w-full gap-3">
          <div
            v-for="room in websocketStore.rooms"
            :key="room.id"
            class="flex items-center justify-between w-72 rounded-md p-2 bg-white text-black border"
          >
            <span>{{ room.name }}</span>
            <span>{{ room.playerCount }}/{{ room.maxPlayers }}</span>
            <button
              :disabled="room.playerCount >= room.maxPlayers || room.state !== 'waiting'"
              @click="joinRoom(room.id)"
              class="px-2 py-1 rounded text-black border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Join
            </button>
          </div>
          <button
            @click="createRoom"
            class="w-72 mt-2 rounded-md px-2 py-2 text-black border border-gray-300 bg-white"
          >
            Create Room
          </button>
        </div>
    </div>
</template>