<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useWebsocketStore } from '@/stores/websocketStore'
import { isEmpty } from '@/utils'

const websocketStore = useWebsocketStore()
const messages = computed(() => websocketStore.roomMessages || [])
</script>

<template>
    <div v-show="websocketStore?.roomMessages?.length > 0" >
        <h1>Messages</h1>
        <div class="flex flex-col items-stretch w-full gap-3" aria-live="assertive" aria-atomic="true" aria-role="log" aria-label="Messages" aria-relevant="additions">
            <div v-for="message in messages.slice(-5)" 
            :key="message" 
            tabindex="0"
            class="rounded-md shadow-md p-0 bg-white text-black">
                <span>{{ message }}</span>
            </div>
        </div>
    </div>
</template>