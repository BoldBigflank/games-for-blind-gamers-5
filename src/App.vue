<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useWebsocketStore } from './stores/websocketStore'
import Lobby from './Lobby.vue'
import Room from './Room.vue'
import User from './User.vue'

const websocketStore = useWebsocketStore()

onUnmounted(() => {
  websocketStore.close()
})

</script>

<template>
  <div class="container mx-auto">
    <h1>Games for Blind Gamers 5</h1>
    <div class="flex flex-col gap-4 items-stretch bg-gray-800 rounded-xl shadow-lg p-6">
      <Lobby />
      <Room />
      <User />
    </div>
    <pre class="text-xs text-left">[room]{{ JSON.stringify(websocketStore.roomBlob, null, 2) }}</pre>
    <pre class="text-xs text-left">[user]{{ JSON.stringify(websocketStore.userBlob, null, 2) }}</pre>
  </div>
</template>

<style scoped></style>
