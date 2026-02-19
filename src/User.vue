<script setup>
import { useWebsocketStore } from './stores/websocketStore'
import { isEmpty } from './utils'

const websocketStore = useWebsocketStore()

const choose = (choice) => {
    websocketStore.action(`room:${websocketStore.roomBlob.id}`, { choice })
}
</script>

<template>
    <div v-if="!isEmpty(websocketStore.userBlob)">
        <h1>User</h1>
        <div id="user-info">
            <p>User ID: {{ websocketStore.userBlob.id }}</p>
        </div>
        <div v-if="websocketStore.userBlob.state === 'choose'">
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
                <div
                    v-for="choice in websocketStore.userBlob.choices"
                    :key="choice.value"
                    class="w-48 aspect-[3/4] bg-white dark:bg-gray-900 rounded-lg shadow-md flex items-center justify-center cursor-pointer hover:-translate-y-2 hover:ring-4 ring-blue-400 transition-transform transition-shadow duration-200"
                    @click="choose(choice.value)"
                >
                    <span class="text-lg font-bold text-gray-900 dark:text-white text-center">{{ choice.label }}</span>
                </div>
            </div>
        </div>
    </div>
</template>