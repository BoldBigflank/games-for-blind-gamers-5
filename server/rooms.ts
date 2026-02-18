import { randomUUID } from 'crypto';
import * as url from 'url';
import { PotionChicken } from './games/potion-chicken';
import { WebSocketServer } from 'ws';
import { colorLog, colorFromSeed, blobLog, generateRoomName } from './utils';
import { Room, ChannelsList } from './types';
import { EventEmitter } from 'events';

const DEBUG = true;

const props = {
    wss: null as WebSocketServer | null,
    eventEmitter: new EventEmitter()
}
// The list of users in each channel
const subscribers = {
    rooms: [] as Room[]
}

const channels: ChannelsList = {

}

export const initRooms = (wss) => {
    props.wss = wss as WebSocketServer;
    wss.on('connection', (socket, req) => {
        // get userId from req.headers.url
        // example: url: '/?userId=770da43d-faae-4a2f-abde-c6bbc9a5ecf1',
        let userId = url.parse(req.url, true).query.userId
        if (!userId || userId === 'null') {
            userId = randomUUID();
        }
        socket.userId = userId;
        // log in green
        if (DEBUG) colorLog('green', `🚶‍➡️ ${userId} -> connected`);
        socket.on('message', (message) => {
            const socketColor = colorFromSeed(socket.userId);
            try {
                const { type, ...data } = JSON.parse(message);
                if (type === 'subscribe') {
                    if (DEBUG) colorLog(socketColor, `📝 ${userId} -> subscribe -> ${data.channel}`);
                    subscribe(socket, data.channel);
                    if (data.channel.startsWith('room:')) {
                        const roomId = data.channel.split(':')[1];
                        let game = channels[data.channel]
                        if (!game || !game.id) {
                            game = new PotionChicken(props.eventEmitter, {
                                id: roomId,
                                name: generateRoomName(),
                                playerCount: 0,
                                maxPlayers: 2
                            })
                            channels[data.channel] = game
                        }
                        // Add the player to the game
                        if (game && game.addPlayer) game.addPlayer(socket.userId);
                        // Remove the user from any other room channels
                        Object.keys(subscribers).forEach(channel => {
                            if (channel === data.channel) {
                                return;
                            }
                            if (channel.startsWith('room:') && subscribers[channel].some(subscriber => subscriber.userId === socket.userId)) {
                                unsubscribe(socket, channel);
                            }
                        });
                        publish('rooms', getChannelData('rooms'));
                    }
                } else if (type === 'unsubscribe') {
                    if (DEBUG) colorLog(socketColor, `🚪 ${userId} -> unsubscribe -> ${data.channel}`);
                    unsubscribe(socket, data.channel);
                }
                else if (type === 'action') {
                    if (DEBUG) colorLog(socketColor, `📨 ${userId} -> action -> ${data.channel}: ${JSON.stringify(data.data)}`);
                    // get a player's room object
                    const room = channels[data.channel]
                    if (room) {
                        room.action?.({ ...data.data, playerId: socket.userId });
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
        // Subscribe them to their user channel
        subscribe(socket, `user:${userId}`);
        Object.keys(subscribers).forEach(channel => {
            if (subscribers[channel].some(subscriber => subscriber.userId === socket.userId)) {
                socket.send(JSON.stringify({
                    channel,
                    data: getChannelData(channel)
                }));
            }
        });
    });
};

const subscribe = (socket, channel) => {
    if (!subscribers[channel]) {
        subscribers[channel] = [];
    }
    // if it doesn't already subscribe, subscribe
    if (!subscribers[channel].some(subscriber => subscriber.userId === socket.userId)) {
        subscribers[channel].push(socket);
    }
    if (!getChannelData(channel)) {
        channels[channel] = {};
    }
    socket.send(JSON.stringify({
        channel,
        data: getChannelData(channel)
    }));
}

const unsubscribe = (socket, channel) => {
    if (!subscribers[channel]) {
        return;
    }
    subscribers[channel] = subscribers[channel].filter(subscriber => subscriber.userId !== socket.userId);
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
    subscribers[channel].forEach(socket => {
        socket.send(JSON.stringify({
            channel,
            data
        }));
    });
}

props.eventEmitter.on('publish', (channel, data) => {
    if (DEBUG) colorLog('blue', `📢 publish -> ${channel}: ${JSON.stringify(data)}`);
    publish(channel, data);
});