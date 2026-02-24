<script setup>
import { useWebsocketStore } from '@/stores/websocketStore'
import { isEmpty } from '@/utils'

const websocketStore = useWebsocketStore()
</script>

<template>
    <div v-if="!isEmpty(websocketStore.roomBlob)">
        <!-- roomBlob.layout will be a 2d array of objects -->
        <!-- The first array will be rows aligned vertically, and inner objects aligned horizontally-->
        <div class="flex flex-col items-center justify-center gap-2">
            <div v-for="row in websocketStore.roomBlob.layout" :key="row.id"
                class="flex flex-row items-center justify-center gap-2">
                <div v-for="item in row" :key="item.id">
                    <div v-if="item.type === 'text'" class="text-2xl font-bold">{{ item.text }}</div>
                    <div v-if="item.type === 'player'" class="player"
                        :class="{ 'player-self': item.id === websocketStore.userBlob.id, 'player-turn': item.attributes.includes('turn'), 'player-lastTurn': item.attributes.includes('lastTurn') }">
                        {{ item.name }} -
                        <span class="inline-block" v-if="item.score !== undefined">
                            <span class="font-bold">{{ item.score }}</span>
                        </span>
                        <span class="inline-block" v-for="i in item.hp" :key="i">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                                stroke="currentColor" class="size-6">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                    d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                            </svg>
                        </span>
                    </div>
                    <!-- If a pile is hidden, show an empty card -->
                    <!-- If it's shown, represent as the top card -->
                    <div v-if="item.type === 'pile' && item.cards.length > 0" class="pile"
                        :class="{ 'pile-hidden': item.attributes.includes('hidden'), 'pile-visible': item.attributes.includes('visible') }">
                        <div v-if="item.attributes.includes('hidden')">
                            <div class="card Aloe"></div>
                        </div>
                        <div v-else>
                            <div class="card" :class="item.cards[0].name">
                                <span class="font-bold">{{ item.cards[0].value }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>