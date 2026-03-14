<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useWebsocketStore } from '@/stores/websocketStore'
import { isEmpty } from '@/utils'

const websocketStore = useWebsocketStore()
// check if roomMessages exists
const messages = computed(() => websocketStore.roomMessages?.map((message, index) => {
    return {
        key: index,
        text: message,
    }
}).slice(-5) ?? [])
</script>

<template>
    <div v-show="websocketStore?.roomMessages?.length > 0">
        <h2>Message Log</h2>
        <div class="flex flex-col items-stretch w-full" aria-live="assertive" aria-atomic="false" aria-role="log"
            aria-label="Messages" aria-relevant="additions">
            <div v-for="message in messages" :key="message.key" tabindex="0" class="">
                <span>{{ message.text }}</span>
            </div>
        </div>
    </div>
</template>