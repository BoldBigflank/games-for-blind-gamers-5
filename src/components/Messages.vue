<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useWebsocketStore } from '@/stores/websocketStore'
import { isEmpty } from '@/utils'

const websocketStore = useWebsocketStore()
</script>

<template>
    <div>
        <h1>Messages</h1>
        <!-- Allow the messages to be tabbed through -->
        <div v-if="websocketStore?.roomMessages?.length > 0" class="flex flex-col items-stretch w-full gap-3" aria-live="assertive" aria-atomic="true" aria-role="log" aria-label="Messages" aria-relevant="additions">
            <!-- use divs instead of li for tabbing -->
            <div v-for="message in websocketStore.roomMessages.slice(-5)" 
            :key="message" 
            tabindex="0"
            class="rounded-md shadow-md p-2 bg-white text-black">
                <span>{{ message }}</span>
            </div>
        </div>
    </div>
</template>