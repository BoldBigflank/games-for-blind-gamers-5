import './style.css'
import { setupWebSocketGameLobbyClient } from './SocketClient.ts'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <h1>Games for Blind Gamers 5</h1>
    <div id="rooms-list"></div>
    <button id="create-room" type="button">Create Room</button>
    <div>
      <textarea id="channel-messages" rows="20" cols="100"></textarea>
    </div>
  </div>
`

setupWebSocketGameLobbyClient()
