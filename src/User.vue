<script setup>
import { useWebsocketStore } from './stores/websocketStore'
import { isEmpty } from './utils'

const websocketStore = useWebsocketStore()
</script>

<template>
    <div v-if="!isEmpty(websocketStore.userBlob)">
        <h1>User</h1>
        <div id="user-info">
            <p>User ID: {{ websocketStore.userBlob.id }}</p>
        </div>
    </div>
</template>