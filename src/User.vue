<script setup>
import { useWebsocketStore } from './stores/websocketStore'
import { isEmpty } from './utils'

const websocketStore = useWebsocketStore()

const choose = (choice) => {
    console.log('[User] Choosing:', choice)
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
            <button v-for="choice in websocketStore.userBlob.choices" :key="choice.value" @click="choose(choice.value)">{{ choice.label }}</button>
        </div>
    </div>
</template>