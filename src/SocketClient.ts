const channels: Record<string, any> = {}
let ws: WebSocket
export function setupWebSocketGameLobbyClient() {
  ws = new WebSocket(`ws://localhost:3000?userId=${localStorage.getItem('user_id')}`)
  // const ws: WebSocket = new WebSocket('wss://games-for-blind-gamers-5.onrender.com:443')
  ws.onopen = () => {
    // subscribe to rooms channel
    ws.send(
      JSON.stringify({
        type: 'subscribe',
        channel: 'rooms',
      })
    )
  }
  ws.onmessage = (event) => {
    const { channel, data } = JSON.parse(event.data)
    channels[channel] = data
    if (channel.startsWith('user:')) {
      // set my own user id
      localStorage.setItem('user_id', channel.split(':')[1])
    }
    if (channel === 'rooms') {
      // update the rooms list
      const rooms = data.public
      updateRoomsList(rooms)
    }
    updateChannelMessages()
  }
  ws.onclose = () => {
    console.log('disconnected')
  }
  document
    .getElementById('create-room')
    ?.addEventListener('click', () =>
      ws.send(JSON.stringify({ type: 'subscribe', channel: `room:${crypto.randomUUID()}` }))
    )
}

function updateChannelMessages() {
  const channelMessages = document.getElementById('channel-messages') as HTMLTextAreaElement
  if (channelMessages) {
    channelMessages.value = `${JSON.stringify(channels, null, 2)}\n`
  }
}
function updateRoomsList(rooms: any[]) {
  const roomsList = document.getElementById('rooms-list')
  if (roomsList) {
    roomsList.innerHTML = ''
    rooms.forEach((room: any) => {
      roomsList.appendChild(document.createElement('div')).innerHTML =
        `${room.name} (${room.playerCount}/${room.maxPlayers})`
      const button = roomsList.appendChild(document.createElement('button'))
      button.innerHTML = 'Join'
      button.addEventListener('click', () => ws.send(JSON.stringify({ type: 'subscribe', channel: `room:${room.id}` })))
    })
  }
}
