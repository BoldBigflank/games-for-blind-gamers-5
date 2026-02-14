// Create two socket client connections
import WebSocket from 'ws';
import { waitForConnection, sleep } from './utils.ts';

export const testGame = async () => {
    const ws1 = new WebSocket('ws://localhost:3000');
    const ws2 = new WebSocket('ws://localhost:3000');
    await waitForConnection(ws1);
    await waitForConnection(ws2);

    const roomId = Math.floor(Math.random() * 1000000);
    const channel = `room:${roomId}`;
    // Join the same room and
    ws1.send(JSON.stringify({ type: 'subscribe', channel }));
    ws2.send(JSON.stringify({ type: 'subscribe', channel }));
    await sleep(1000);

    // // Start the game
    // ws1.send(JSON.stringify({ type: 'action', channel, data: { action: 'start' } }));

    // await sleep(1000);
    // // Player 1 plays a card
    // ws1.send(JSON.stringify({ type: 'action', channel, data: { action: 'choose', choice: 0 } }));
    // await sleep(1000);

    // // Player 2 plays a card
    // ws2.send(JSON.stringify({ type: 'action', channel, data: { action: 'choose', choice: 0 } }));
    // await sleep(1000);

    // // Player 1 challenges the previous player
    // ws1.send(JSON.stringify({ type: 'action', channel, data: { action: 'choose', choice: 'challenge' } }));
    // await sleep(1000);

    // // Player 2 drinks the potion
    // ws2.send(JSON.stringify({ type: 'action', channel, data: { action: 'choose', choice: 'drink' } }));
    // await sleep(1000);

    // // Player 2 starts the next round
    // ws2.send(JSON.stringify({ type: 'action', channel, data: { action: 'choose', choice: 'start' } }));
    // await sleep(1000);

    // // Player 2 plays a card
    // ws2.send(JSON.stringify({ type: 'action', channel, data: { action: 'choose', choice: 0 } }));
    // await sleep(1000);

    // // Player 1 plays a card
    // ws1.send(JSON.stringify({ type: 'action', channel, data: { action: 'choose', choice: 0 } }));
    // await sleep(1000);

    // // Player 2 plays a card
    // ws2.send(JSON.stringify({ type: 'action', channel, data: { action: 'choose', choice: 0 } }));
    // await sleep(1000);

    // // Player 1 challenges the previous player
    // ws1.send(JSON.stringify({ type: 'action', channel, data: { action: 'choose', choice: 'challenge' } }));
    // await sleep(1000);

    // // Player 2 drinks the potion
    // ws2.send(JSON.stringify({ type: 'action', channel, data: { action: 'choose', choice: 'drink' } }));
    // await sleep(1000);

    // // Player 2 starts the next round
    // ws2.send(JSON.stringify({ type: 'action', channel, data: { action: 'choose', choice: 'start' } }));

    // Close the connections
    ws1.close();
    ws2.close();
}

testGame();