<script setup>
import { useWebsocketStore } from './stores/websocketStore'
import { isEmpty } from './utils'

const websocketStore = useWebsocketStore()
</script>

<template>
    <div v-if="!isEmpty(websocketStore.roomBlob)">
        <h1>{{websocketStore.roomBlob.name}}</h1>
        <div id="room-info">
            <p>Room Name: {{ websocketStore.roomBlob.name }}</p>
            <p>Room ID: {{ websocketStore.roomBlob.id }}</p>
            <p>Room Player Count: {{ websocketStore.roomBlob.playerCount }}</p>
            <p>Room Max Players: {{ websocketStore.roomBlob.maxPlayers }}</p>
            <p>Room Turn: {{ websocketStore.roomBlob.turn }}</p>
        </div>
    </div>
</template>