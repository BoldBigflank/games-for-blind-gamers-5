const channels: Record<string, any> = {}
let ws: WebSocket

// const publish = (channel: string, data: any) => {
//   console.log(`publish -> ${channel}: ${JSON.stringify(data)}`)
//   ws.send(JSON.stringify({ type: 'publish', channel, data }))
// }
const subscribe = (channel: string) => {
  console.log(`subscribe -> ${channel}`)
  ws.send(JSON.stringify({ type: 'subscribe', channel }))
}
const unsubscribe = (channel: string) => {
  console.log(`unsubscribe -> ${channel}`)
  ws.send(JSON.stringify({ type: 'unsubscribe', channel }))
  delete channels[channel]
  updateChannelMessages()
}

export function setupWebSocketGameLobbyClient() {
  ws = new WebSocket(`ws://localhost:3000?userId=${localStorage.getItem('user_id')}`)
  // const ws: WebSocket = new WebSocket('wss://games-for-blind-gamers-5.onrender.com:443')
  ws.onopen = () => {
    // subscribe to rooms channel
    subscribe('rooms')
  }
  ws.onmessage = (event) => {
    console.log(`onmessage -> ${event.data}`)
    const { channel, data } = JSON.parse(event.data)
    channels[channel] = data
    if (channel.startsWith('user:')) {
      // set my own user id
      localStorage.setItem('user_id', channel.split(':')[1])
    }
    if (channel === 'rooms') {
      // update the rooms list
      updateRoomsList(data)
    }
    updateChannelMessages()
  }
  ws.onclose = () => {
    console.log('disconnected')
  }
  document.getElementById('create-room')?.addEventListener('click', () => {
    const roomId = crypto.randomUUID()
    subscribe(`room:${roomId}`)
    unsubscribe('rooms')
  })
}

function updateChannelMessages() {
  const channelMessages = document.getElementById('channel-messages') as HTMLTextAreaElement
  if (channelMessages) {
    channelMessages.value = `${JSON.stringify(channels, null, 2)}\n`
  }
}
function updateRoomsList(rooms: any[]) {
  console.log(`updateRoomsList -> ${JSON.stringify(rooms, null, 2)}`)
  const roomsList = document.getElementById('rooms-list')
  if (roomsList) {
    roomsList.innerHTML = ''
    rooms.forEach((room: any) => {
      roomsList.appendChild(document.createElement('div')).innerHTML =
        `${room.name} (${room.playerCount}/${room.maxPlayers})`
      const button = roomsList.appendChild(document.createElement('button'))
      button.innerHTML = 'Join'
      button.addEventListener('click', () => subscribe(`room:${room.id}`))
    })
  }
}
