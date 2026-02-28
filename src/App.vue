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

</script>

<template>
  <!-- Top right corner shows connection status -->
  <div class="absolute top-0 left-0">
    <span>Connection Status: {{ websocketStore.connectionStatus }}</span><br/>
  </div>
  <div class="container mx-auto">
    <h1>Hidden Hand</h1>
    <div class="flex flex-col gap-4 items-stretch bg-gray-800 rounded-xl shadow-lg p-6">
      <Lobby />
      <Messages />
      <Room />
      <User />
    </div>
    <pre class="text-xs text-left">[room]{{ JSON.stringify(websocketStore.roomBlob, null, 2) }}</pre>
    <pre class="text-xs text-left">[user]{{ JSON.stringify(websocketStore.userBlob, null, 2) }}</pre>
    <pre class="text-xs text-left">[rooms]{{ JSON.stringify(websocketStore.rooms, null, 2) }}</pre>
  </div>
</template>

<style scoped></style>
