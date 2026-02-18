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
  <p>
    Visit <a href="https://vuejs.org/" target="_blank" rel="noopener">vuejs.org</a> to read the
    documentation
  </p>
  <Lobby />
  <Room />
  <User />
</template>

<style scoped></style>
