<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useWebsocketStore } from '@/stores/websocketStore'
import Lobby from './components/Lobby.vue'
import Room from './components/Room.vue'
import User from './components/User.vue'
import Messages from './components/Messages.vue'

const websocketStore = useWebsocketStore()

onUnmounted(() => {
  websocketStore.close()
})

const leaveRoom = () => {
  websocketStore.unsubscribe(`room:${websocketStore.roomBlob.id}`)
  websocketStore.roomBlob = {}
}
</script>

<template>
  <!-- Top right corner shows connection status -->
  <div class="absolute top-0 left-0">
    <span>Connection Status: {{ websocketStore.connectionStatus }}</span><br />
  </div>
  <div class="container mx-auto">
    <h1 v-if="websocketStore.roomBlob.gameName">
      {{ websocketStore.roomBlob.gameName }}
      <button @click="leaveRoom"
        class="rounded-md bg-slate-800 py-2 px-4 border border-transparent text-center text-sm text-white transition-all shadow-md hover:shadow-lg focus:bg-slate-700 focus:shadow-none cursor-pointer active:bg-slate-700 hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed">
        Leave Room
      </button>
    </h1>
    <h1 v-else>Game Lobby</h1>
    <div class="flex flex-col gap-4 items-stretch bg-gray-800 rounded-xl shadow-lg p-6">
      <Lobby />
      <Messages />
      <Room />
      <User />
    </div>
  </div>
</template>

<style scoped></style>
