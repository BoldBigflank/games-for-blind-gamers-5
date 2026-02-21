<script setup>
import { useWebsocketStore } from '@/stores/websocketStore'
import { isEmpty } from '@/utils'

const websocketStore = useWebsocketStore()

const choose = (choice) => {
    websocketStore.action(`room:${websocketStore.roomBlob.id}`, { choice })
}
const changeName = () => {
    const name = prompt('What is your name?')
    if (!name) {
        return;
    }
    localStorage.setItem('user_name', name)
    websocketStore.action(`room:${websocketStore.roomBlob.id}`, { choice: `name:${name}` })
}
</script>

<template>
    <div v-if="!isEmpty(websocketStore.userBlob)">
        <h1>
            {{ websocketStore.userBlob.name }}
            <button @click="changeName" aria-label="Change Name">
                <span class="sr-only">Change Name</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
    <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
    </svg>
            </button>
        </h1>
        <div id="user-info">
            <div id="hand" class="flex flex-wrap gap-2 items-center justify-center">
                <div
                    v-for="card in websocketStore.userBlob.hand"
                    :key="card.id"
                    :class="`${card.name}`"
                    class="w-12 aspect-[3/4] rounded-lg flex items-center justify-center shadow-md"
                    style="box-shadow: 0 4px 12px rgba(0,0,0,0.3);"
                    :aria-label="`${card.value} ${card.name}`"
                >
                    <span class="font-bold">{{ card.value }}</span>
                </div>
            </div>
        </div>
        <div v-if="websocketStore.userBlob.state === 'choose'">
            <div class="text-lg font-bold text-gray-900 dark:text-white text-center">{{ websocketStore.userBlob.prompt }}</div>
            <div
                class="
                    grid
                    gap-4 
                    justify-center
                    grid-cols-1
                    sm:grid-cols-2
                    md:grid-cols-3
                    lg:grid-cols-4
                    xl:grid-cols-5
                "
            >
            <button
                v-for="choice in websocketStore.userBlob.choices"
                :key="choice.value"
                :aria-label="choice.label"
                role="button"
                tabindex="0"
                :class="`${choice.class} choice`"
                @click="choose(choice.value)"
            >
                <span class="text-lg font-bold text-gray-900 dark:text-white text-center">{{ choice.label }}</span>
            </button>
            </div>
        </div>
    </div>
</template>