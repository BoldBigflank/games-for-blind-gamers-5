import { randomUUID } from 'crypto';
import * as url from 'url';
import { PotionChicken } from './games/potion-chicken';
import { RatATatCat } from './games/rat-a-tat-cat';
import { WebSocketServer, WebSocket } from 'ws';
import { colorLog, colorFromSeed, blobLog, generateRoomName } from './utils';
import { Room, ChannelsList } from './types';
import { EventEmitter } from 'events';

const DEBUG = true;

const props = {
    wss: null as WebSocketServer | null,
    eventEmitter: new EventEmitter()
}
// The list of users in each channel
const subscribers: Record<string, string[]> = {}

const channels: ChannelsList = { }

const games: Record<string, Room> = {}

const sockets: Record<string, WebSocket> = {}


export const initRooms = (wss) => {
    props.wss = wss as WebSocketServer;
    wss.on('connection', (socket: WebSocket, req) => {
        // get userId from req.headers.url
        // example: url: '/?userId=770da43d-faae-4a2f-abde-c6bbc9a5ecf1&userName=John',
        let userId: string = url.parse(req.url, true).query.userId as string || ''
        let userName = url.parse(req.url, true).query.userName
        if (!userId || userId === 'null' || userId === '') {
            userId = randomUUID();
        }
        if (!userName || userName === 'null' || userName === '') {
            userName = `Player ${userId.slice(0, 8)}`;
        }
        sockets[userId] = socket;
        socket.userId = userId;
        socket.userName = userName;
        if (DEBUG) colorLog('green', `🚶‍➡️ ${userId} -> connected`);
        socket.on('message', (message) => {
            const socketColor = colorFromSeed(userId);
            try {
                const { type, ...data } = JSON.parse(message);
                if (type === 'subscribe') {
                    if (DEBUG) colorLog(socketColor, `📝 ${userId} -> subscribe -> ${data.channel}`);
                    subscribe(userId, data.channel);
                    if (data.channel.startsWith('room:')) {
                        const roomId = data.channel.split(':')[1];
                        let game = games[data.channel]
                        if (!game || !game.id) {
                            game = new RatATatCat(props.eventEmitter, {
                                id: roomId,
                                name: generateRoomName(),
                                playerCount: 0,
                                maxPlayers: 4
                            })
                            games[data.channel] = game
                        }
                        // Add the player to the game
                        if (game && game.addPlayer) game.addPlayer(userId, socket.userName);
                        // Remove the user from any other room channels
                        Object.keys(subscribers).forEach(channel => {
                            if (channel === data.channel) {
                                return;
                            }
                            if (channel.startsWith('room:') && subscribers[channel].some(subscriber => subscriber === userId)) {
                                unsubscribe(userId, channel);
                            }
                        });
                        publish('rooms', getChannelData('rooms'));
                    }
                } else if (type === 'unsubscribe') {
                    if (DEBUG) colorLog(socketColor, `🚪 ${userId} -> unsubscribe -> ${data.channel}`);
                    unsubscribe(userId, data.channel);
                }
                else if (type === 'action') {
                    if (DEBUG) colorLog(socketColor, `📨 ${userId} -> action -> ${data.channel}: ${JSON.stringify(data.data)}`);
                    if (data.data.choice?.startsWith('name:')) {
                        socket.userName = data.data.choice.split(':')[1];
                    }
                    // get a player's room object
                    const room = games[data.channel]
                    if (room) {
                        room.action?.({ ...data.data, playerId: socket.userId });
                    } else {
                        console.error('room not found', data.channel);
                    }
                }
                else if (type === 'publish') {
                    if (DEBUG) colorLog(socketColor, `📢 ${userId} -> publish -> ${data.channel}: ${JSON.stringify(data.data)}`);
                    channels[data.channel] = data.data;
                    publish(data.channel, data.data);
                }
            } catch (error: any) {
                console.error(`${userId} -> error parsing message: ${error.message}`);
                if (DEBUG) colorLog('red', `❌ ${userId} -> error parsing message: ${error.message}`);
            }
        });
        Object.keys(subscribers).forEach(channel => {
            if (subscribers[channel].some(subscriber => subscriber === userId)) {
                if (DEBUG) colorLog('green', `🚶‍➡️ ${userId} -> subscribing to ${channel}`);
                subscribe(userId, channel);
            }
        });
        subscribe(userId, 'rooms');
        subscribe(userId, `user:${userId}`);
        // subscribe to rooms that the user is already in
        Object.keys(games).forEach(gameKey => {
            const game = games[gameKey];
            if (game && game.players?.some(player => player.id === userId)) {
                subscribe(userId, `room:${game.id}`);
            }
        });
        Object.keys(subscribers).forEach(channel => {
            if (subscribers[channel].some(subscriber => subscriber === userId)) {
                subscribe(userId, channel);
            }
        });
    });
};

const subscribe = (userId, channel) => {
    if (!subscribers[channel]) {
        subscribers[channel] = [];
    }
    // if it doesn't already subscribe, subscribe
    if (!subscribers[channel].some(subscriber => subscriber === userId)) {
        subscribers[channel].push(userId);
    }
    sockets[userId]?.send(JSON.stringify({
        channel,
        data: getChannelData(channel)
    }));
    if (DEBUG) colorLog('green', `🚶‍➡️ ${userId} -> subscribed to ${channel}`);
}

const unsubscribe = (userId, channel) => {
    if (!subscribers[channel]) {
        return;
    }
    subscribers[channel] = subscribers[channel].filter(subscriber => subscriber !== userId);
    if (DEBUG) colorLog('green', `🚶‍➡️ ${userId} -> unsubscribed from ${channel}`);
}

const getChannelData = (channel: string) => {
    if (channel === 'rooms') {
        return Object.keys(channels)
            .filter(channelKey => channelKey?.startsWith('room:'))
            .map((channelKey) => channels[channelKey])
    }
    return channels[channel] || {};
}

const publish = (channel, data) => {
    if (DEBUG) blobLog({ channel, data });
    if (!subscribers[channel]) {
        if (DEBUG) colorLog('yellow', `❌ publish -> ${channel} not found`);
        return;
    }
    channels[channel] = data;
    subscribers[channel].forEach(userId => {
        sockets[userId]?.send(JSON.stringify({
            channel,
            data
        }));
    });
}

props.eventEmitter.on('publish', (channel, data) => {
    publish(channel, data);
});