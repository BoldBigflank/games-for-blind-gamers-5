import './style.css'
import { setupWebSocketGameLobbyClient } from './SocketClient.ts'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <h1>Games for Blind Gamers 5</h1>
    <div id="lobby">
      <div id="rooms-list">
      <button id="create-room" type="button">Create Room</button>
    </div>
    </div>
    <div id="game-info">Game Info</div>
    <div id="game-actions">
      Game Actions
      <div id="game-actions-prompt"></div>
      <div id="game-actions-buttons">
      </div>
    </div>
    <div>
      <textarea id="channel-messages" rows="20" cols="100"></textarea>
    </div>
  </div>
`

setupWebSocketGameLobbyClient()
