<script setup>
import { useWebsocketStore } from '@/stores/websocketStore'
import { isEmpty } from '@/utils'
import { ref } from 'vue'

const websocketStore = useWebsocketStore()
const collapsed = ref(true)
const toggleCollapse = () => {
    collapsed.value = !collapsed.value
}
</script>

<template>
    <div class="relative" v-if="!isEmpty(websocketStore.roomBlob)">
        <!-- tailwind collapsible panel -->
        <div v-if="websocketStore.roomBlob.gameName === 'hidden-hand'" class="absolute top-0 left-0 text-left">
            <button @click="toggleCollapse"
                class="rounded-md bg-slate-800 py-2 px-4 border border-transparent text-center text-sm text-white transition-all shadow-md hover:shadow-lg focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                type="button">
                {{ collapsed ? 'Instructions' : 'Hide Instructions' }}
            </button>
            <div v-show="!collapsed"
                class="border border-slate-200 rounded-md p-4 mt-2 w-full basis-full overflow-hidden transition-all duration-300 ease-in-out bg-black">
                <ul class="list-disc list-inside text-left">
                    <li>Given four cards, remember their values, because two will be hidden before play begins.</li>
                    <li>On your turn, choose either from the top of the discard pile or draw from the deck.</li>
                    <li>Once chosen, choose one position do discard, replacing with the chosen card.</li>
                    <li>You may choose to end the round, and after everyone else gets one more turn, the round ends.
                    </li>
                    <li>At the end of the round, the value of your cards is added to your score.</li>
                    <li>After all rounds are played, the player with the highest score wins.</li>
                </ul>
            </div>
        </div>
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
                    <div v-if="item.type === 'pile' && item.cards.length > 0" class="pile card" :aria-label="item.name"
                        :class="{
                            'pile-hidden': item.attributes.includes('hidden'),
                            'pile-visible': item.attributes.includes('visible')
                        }">
                        <div v-if="item.attributes.includes('hidden')" class="label">
                            ???
                        </div>
                        <div v-else class="label">
                            {{ item.cards[0].value }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>