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
        <div class="flex flex-col items-center w-full gap-3 border p-4 rounded-md">
          <h2 class="text-2xl font-bold">How to Play</h2>
          <ul class="list-disc list-inside text-left">
            <li>Given four cards, remember their values, because two will be hidden before play begins.</li>
            <li>On your turn, choose either from the top of the discard pile or draw from the deck.</li>
            <li>Once chosen, choose one position do discard, replacing with the chosen card.</li>
            <li>You may choose to end the round, and after everyone else gets one more turn, the round ends.</li>
            <li>At the end of the round, the value of your cards is added to your score.</li>
            <li>After all rounds are played, the player with the highest score wins.</li>
          </ul>
          <!-- <ul class="list-disc list-inside text-left">
            <li>A cauldron starts with 2 random herbs in it. Take turns adding herbs to the pot.</li>
            <li>Each herb works as an antidote to one other herb.</li>
            <li>You may challenge the previous player to drink the potion.</li>
            <li>If you have enough antidote in your hand, you win the challenge and the challenger loses a heart.</li>
            <li>Otherwise, you lose a heart.</li>
            <li>The last person with a heart wins.</li>
          </ul> -->
        </div>
        <div class="flex flex-col items-center w-full gap-3">
          <h2 class="text-2xl font-bold">Rooms</h2>
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