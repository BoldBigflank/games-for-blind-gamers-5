import { randomUUID } from 'crypto';
import * as url from 'url';
import { PotionChicken } from './games/potion-chicken';
import { WebSocketServer } from 'ws';

import { Room, ChannelsList, ActionResponse } from './types';

const props = {
    wss: null as WebSocketServer | null,
}
// The list of users in each channel
const subscribers = {
    rooms: [] as Room[]
}

const channels: ChannelsList = {
    rooms: {
        public: [{
            toString: () => '',
            id: randomUUID(),
            name: 'Room 1',
            playerCount: 0,
            maxPlayers: 2
        }
        ]
    }
}

export const initRooms = (wss) => {
    props.wss = wss as WebSocketServer;
    wss.on('connection', (socket, req) => {
        // get userId from req.headers.url
        // example: url: '/?userId=770da43d-faae-4a2f-abde-c6bbc9a5ecf1',
        const userId = url.parse(req.url, true).query.userId || randomUUID();
        socket.userId = userId;
        console.log(`${userId} -> connected`);
        socket.on('message', (message) => {
            try {
                const { type, ...data } = JSON.parse(message);
                if (type === 'subscribe') {
                    console.log(`${userId} -> subscribe -> ${data.channel}`);
                    subscribe(socket, data.channel);
                    if (data.channel.startsWith('room:')) {
                        const roomId = data.channel.split(':')[1];
                        let game = channels[data.channel]
                        if (Object.keys(game).length === 0 || game === undefined) {
                            game = new PotionChicken({
                                id: roomId,
                                name: `Room ${channels.rooms.public.length + 1}`,
                                playerCount: 0,
                                maxPlayers: 2
                            })
                            channels[data.channel] = game
                        }
                        // Remove the user from any other room channels
                        Object.keys(subscribers).forEach(channel => {
                            if (channel === data.channel) {
                                return;
                            }
                            if (channel.startsWith('room:') && subscribers[channel].some(subscriber => subscriber.userId === socket.userId)) {
                                unsubscribe(socket, channel);
                            }
                        });
                        // If it's not in the public room, add it
                        if (!channels.rooms.public.some(room => room.id === roomId)) {
                            channels.rooms.public.push({
                                id: roomId,
                                name: `Room ${channels.rooms.public.length + 1}`,
                                playerCount: 0,
                                maxPlayers: 2
                            });
                        }
                        // Update rooms player count
                        channels.rooms.public = channels.rooms.public.map(room => {
                            if (room.id === roomId) {
                                room.playerCount = subscribers[data.channel].length;
                            }
                            return room;
                        });
                        publish('rooms', channels.rooms);
                    }
                } else if (type === 'unsubscribe') {
                    console.log(`${userId} -> unsubscribe -> ${data.channel}`);
                    unsubscribe(socket, data.channel);
                }
                else if (type === 'action') {
                    console.log(`${userId} -> action -> ${data.channel}: ${JSON.stringify(data.data)}`);
                    // get a player's room object
                    const room = channels[data.channel]
                    if (room) {
                        const response: ActionResponse = room.action?.({ ...data.data, playerId: socket.userId }) || [];
                        response.forEach(message => {
                            publish(message.channel, message.data);
                        });
                        publish(`room:${room.id}`, room.toString());
                    }
                }
                else if (type === 'publish') {
                    console.log(`${userId} -> publish -> ${data.channel}: ${JSON.stringify(data.data)}`);
                    channels[data.channel] = data.data;
                    publish(data.channel, data.data);
                }
            } catch (error: any) {
                console.error(`${userId} -> error parsing message: ${error.message}`);
                console.log(message)
            }
        });
        // Subscribe them to their user channel
        subscribe(socket, `user:${userId}`);
        Object.keys(subscribers).forEach(channel => {
            if (subscribers[channel].some(subscriber => subscriber.userId === socket.userId)) {
                socket.send(JSON.stringify({
                    channel,
                    data: channels[channel]
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
    if (!channels[channel]) {
        channels[channel] = {};
    }
    socket.send(JSON.stringify({
        channel,
        data: channels[channel]
    }));
}

const unsubscribe = (socket, channel) => {
    if (!subscribers[channel]) {
        return;
    }
    subscribers[channel] = subscribers[channel].filter(subscriber => subscriber.userId !== socket.userId);
}

const publish = (channel, data) => {
    if (!subscribers[channel]) {
        console.log(`publish -> ${channel} not found`)
        return;
    }
    subscribers[channel].forEach(socket => {
        socket.send(JSON.stringify({
            channel,
            data
        }));
    });
}
