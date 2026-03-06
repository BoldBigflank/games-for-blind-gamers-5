<script setup>
import { useWebsocketStore } from '@/stores/websocketStore'
import { isEmpty } from '@/utils'

const websocketStore = useWebsocketStore()

const choose = (choice) => {
    websocketStore.action(`room:${websocketStore.roomBlob.id}`, { choice })
}
</script>

<template>
    <div v-if="!isEmpty(websocketStore.userBlob)">
        <h1>
            {{ websocketStore.userBlob.name }}

        </h1>
        <div id="user-info">
            <div id="hand" class="flex flex-wrap gap-2 items-center justify-center">
                <div v-for="card in websocketStore.userBlob.hand" :key="card.id" :class="`${card.name}`"
                    class="card w-12 aspect-[3/4] rounded-lg flex items-center justify-center shadow-md"
                    style="box-shadow: 0 4px 12px rgba(0,0,0,0.3);" :aria-label="`${card.value} ${card.name}`">
                    <span class="label font-bold">{{ card.value }}</span>
                </div>
            </div>
        </div>
        <div v-if="websocketStore.userBlob.state === 'choose'">
            <div class="text-lg font-bold text-gray-900 dark:text-white text-center">{{ websocketStore.userBlob.prompt
                }}</div>
            <div class="
                    flex flex-wrap gap-4 items-center justify-center
                    w-full
                ">
                <button v-for="choice in websocketStore.userBlob.choices" :key="choice.value" :aria-label="choice.label"
                    role="button" tabindex="0" :class="`${choice.class} choice`" @click="choose(choice.value)" class="cursor-pointer transition-all bg-blue-500 text-white px-6 py-2 rounded-lg
border-blue-600
border-b-[4px] hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[6px]
active:border-b-[2px] active:brightness-90 active:translate-y-[2px]">
                    {{ choice.label }}
                </button>
            </div>
        </div>
    </div>
</template>