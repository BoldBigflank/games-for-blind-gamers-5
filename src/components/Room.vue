<script setup>
import { useWebsocketStore } from '@/stores/websocketStore'
import { isEmpty } from '@/utils'

const websocketStore = useWebsocketStore()
</script>

<template>
    <div v-if="!isEmpty(websocketStore.roomBlob)">
        <div class="flex flex-col items-center justify-center gap-2" id="room-info">
            <div class="flex flex-col items-center justify-center gap-2">
                <h1>{{websocketStore.roomBlob.name}}</h1>
            </div>
            <!-- How to play section, full width -->
            <div class="flex flex-col items-center justify-center gap-2">
            <div class="flex items-center justify-center gap-2 text-2xl font-bold">
                <span class="card Aloe" aria-label="Aloe"></span> > <span class="card Belladonna" aria-label="Belladonna"></span> > <span class="card Cactus" aria-label="Cactus"></span> > <span class="card Aloe" aria-label="Aloe"></span>
            </div>
            </div>
            <!-- Players and Pot sections container - side by side on wide screens, stacked on narrow -->
            <div class="flex flex-row flex-wrap justify-center gap-4 w-full">
                <!-- Players section -->
                <div class="flex flex-col items-center justify-center gap-2 flex-1 min-w-[250px]">
                    <h1>Players</h1>
                    <div v-for="player, index in websocketStore.roomBlob.players" :key="player.id">
                        <div class="player" :class="{ 'player-turn': index === websocketStore.roomBlob.turn, 'player-self': player.id === websocketStore.userBlob.id }">{{ player.name }} - 
                            <span class="inline-block" v-for="i in player.hp" :key="i">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
        </svg>

                            </span>
                            </div>
                    </div>
                </div>
                <!-- Pot section -->
                <div class="flex flex-col items-center justify-center gap-2 flex-1 min-w-[250px]">
                    <h1>Pot</h1>
                    <div>{{  websocketStore.roomBlob.pot.length }} cards in the pot</div>
                    <div v-if="websocketStore.roomBlob.state === 'challenging'">
                        <div class="flex items-center justify-center gap-2 text-2xl font-bold">
                            <span v-for="card in websocketStore.roomBlob.pot" :key="card.id" :class="`${card.name}`" class="card" :aria-label="`${card.value} ${card.name}`">
                                <span class="font-bold">{{ card.value }}</span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>