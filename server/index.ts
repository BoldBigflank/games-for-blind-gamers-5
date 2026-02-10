const WebSocketServer = require('ws').WebSocketServer;
const { initRooms } = require('./rooms');
const { PotionChicken } = require('./games/potion-chicken');

const port = process.env.PORT || 3000;

const wss = new WebSocketServer({ port });
initRooms(wss);
console.log(`WebSocket server listening on port ${port}`);

// server.listen(port);