export function setupWebSocketGameLobbyClient(element: HTMLButtonElement) {
  const ws: WebSocket = new WebSocket('ws://localhost:3000')
  ws.onopen = () => {
    console.log('connected to server')
  }
  ws.onmessage = (event) => {
    console.log(event.data)
  }
  ws.onclose = () => {
    console.log('disconnected')
  }
  element.addEventListener('click', () => ws.send('create'))
}

export function setupCounter(element: HTMLButtonElement) {
  let counter = 0
  const setCounter = (count: number) => {
    counter = count
    element.innerHTML = `count is ${counter}`
  }
  element.addEventListener('click', () => setCounter(counter + 1))
  setCounter(0)
}
