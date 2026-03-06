<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useWebsocketStore } from '@/stores/websocketStore'
import Lobby from './components/Lobby.vue'
import Room from './components/Room.vue'
import User from './components/User.vue'
import Messages from './components/Messages.vue'

const websocketStore = useWebsocketStore()
const collapsed = ref(true)
const toggleCollapse = () => {
  collapsed.value = !collapsed.value
}
onUnmounted(() => {
  websocketStore.close()
})

const leaveRoom = () => {
  websocketStore.unsubscribe(`room:${websocketStore.roomBlob.id}`)
  websocketStore.roomBlob = {}
}

const changeName = () => {
  const name = prompt('What is your name?')
  if (!name) {
    return;
  }
  localStorage.setItem('user_name', name)
  if (websocketStore.roomBlob?.id) {
    websocketStore.action(`room:${websocketStore.roomBlob.id}`, { choice: `name:${name}` })
  }
}
const connectionEmoji = computed(() => {
  return websocketStore.connectionStatus === 'connected' ? '🟢' : websocketStore.connectionStatus === 'disconnected' ? '🔴' : '🟡'
})
</script>

<template>
  <div class="sticky top-0 left-0 bg-gray-400 p-4 w-full flex justify-between items-center">
    <div class="flex flex-row gap-2">
      <span class="text-left w-1 h-12 flex items-center justify-center"
        :aria-label="`Connection Status: ${websocketStore.connectionStatus}`">{{
          connectionEmoji
        }}</span>
      <div v-if="websocketStore.userBlob.name">
        <span class="text-left font-bold">{{ websocketStore.userBlob.name }}</span>
        <button @click="changeName" aria-label="Change Name">
          <span class="sr-only">Change Name</span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
            stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
          </svg>
        </button>
      </div>
    </div>
    <div class="flex flex-row gap-2">
      <h1 v-if="websocketStore.roomBlob.gameName">
        {{ websocketStore.roomBlob.gameName }}
      </h1>
      <h1 v-else>Game Lobby</h1>
    </div>
    <div class="flex flex-row gap-2">
      <div v-if="websocketStore.roomBlob.gameName === 'Hidden Hand'" class="">
        <button @click="toggleCollapse"
          class="rounded-md bg-slate-800 py-2 px-4 border border-transparent text-center text-sm text-white transition-all shadow-md hover:shadow-lg focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
          type="button">
          {{ collapsed ? 'Instructions' : 'Hide Instructions' }}
        </button>
      </div>
      <button v-if="websocketStore.roomBlob.gameName" @click="leaveRoom"
        class="rounded-md bg-slate-800 py-2 px-4 border border-transparent text-center text-sm text-white transition-all shadow-md hover:shadow-lg focus:bg-slate-700 focus:shadow-none cursor-pointer active:bg-slate-700 hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed">
        Leave Room
      </button>
    </div>
  </div>
  <div v-show="!collapsed"
    class="absolute top-0 left-0 z-10 border border-slate-200 rounded-md p-4 mt-2 w-full basis-full overflow-hidden transition-all duration-300 ease-in-out bg-black">
    <ul class="list-disc list-inside text-left">
      <li>Given four cards, remember their values, because two will be hidden before play begins.</li>
      <li>On your turn, choose either from the top of the discard pile or draw from the deck.</li>
      <li>Once chosen, choose one position do discard, replacing with the chosen card.</li>
      <li>You may choose to end the round, and after everyone else gets one more turn, the round ends.
      </li>
      <li>At the end of the round, the value of your cards is added to your score.</li>
      <li>After all rounds are played, the player with the highest score wins.</li>
    </ul>
    <button @click="toggleCollapse"
      class="rounded-md bg-slate-800 py-2 px-4 border border-transparent text-center text-sm text-white transition-all shadow-md hover:shadow-lg focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed">
      Hide Instructions
    </button>
  </div>
  <div class="container mx-auto">
    <div class="flex flex-col gap-4 items-stretch bg-gray-800 rounded-xl shadow-lg p-6">
      <Lobby />
      <Messages />
      <Room />
      <User />
    </div>
  </div>
</template>

<style scoped></style>
