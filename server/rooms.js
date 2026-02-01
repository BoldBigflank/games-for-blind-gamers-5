import crypto from 'crypto';
import url from 'url';
const rooms = new Map();

const props = {}
// The list of users in each channel
const subscribers = {
    rooms: []
}
// The blobs themselves (rooms, user:x, room:x, etc.)
const channels = {
    rooms: {
        public: [{
            id: crypto.randomUUID(),
            name: 'Room 1',
            playerCount: 0,
            maxPlayers: 2
        }]
    },
}

export const initRooms = (wss) => {
    props.wss = wss;
    wss.on('connection', (socket, req) => {
        // get userId from req.headers.url
        // example: url: '/?userId=770da43d-faae-4a2f-abde-c6bbc9a5ecf1',
        const userId = url.parse(req.url, true).query.userId || crypto.randomUUID();
        socket.userId = userId;
        console.log(`${userId} -> connected`);
        socket.on('message', (message) => {
            try {
                const { type, ...data } = JSON.parse(message);
                if (type === 'subscribe') {
                    console.log(`${userId} -> subscribe -> ${data.channel}`);
                    subscribe(socket, data.channel);
                    if (data.channel.startsWith('user:')) {
                        socket.userId = data.channel.split(':')[1];
                    }
                    if (data.channel.startsWith('room:')) {
                        const roomId = data.channel.split(':')[1];
                        // Remove the user from any other room channels
                        Object.keys(subscribers).forEach(channel => {
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
                } else if (type === 'publish') {
                    console.log(`${userId} -> publish -> ${data.channel}`);
                    publish(data.channel, data.data);
                }
            } catch (error) {
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
        return;
    }
    subscribers[channel].forEach(socket => {
        socket.send(JSON.stringify({
            channel,
            data
        }));
    });
}
