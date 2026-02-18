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
  <h1>Games for Blind Gamers 5</h1>
  <Lobby />
  <Room />
  <User />
  <pre>[room]{{ JSON.stringify(websocketStore.roomBlob, null, 2) }}</pre>
  <pre>[user]{{ JSON.stringify(websocketStore.userBlob, null, 2) }}</pre>
</template>

<style scoped></style>
