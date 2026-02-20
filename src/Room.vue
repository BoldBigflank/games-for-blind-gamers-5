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
            <p>Room state: {{ websocketStore.roomBlob.state }}</p>
            <div v-for="player in websocketStore.roomBlob.players" :key="player.id">
                <p>{{ player.name }} - {{ player.hp }} HP</p>
            </div>
            <p>Messages:
                <ul aria-live="polite" aria-atomic="true">
                    <li v-for="message in websocketStore.roomMessages" :key="message">{{ message }}</li>
                </ul>
            </p>
            <div>{{  websocketStore.roomBlob.pot.length }} cards in the pot</div>
        </div>
    </div>
</template>