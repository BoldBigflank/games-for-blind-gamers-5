import crypto from 'crypto';

const rooms = new Map();

const props = {}
const subscribers = {
    rooms: []
}
const channels = {
    rooms: {
        public: []
    },
}

export const initRooms = (wss) => {
    props.wss = wss;
    wss.on('connection', (socket) => {
        // subscribe to rooms channel and user id channel
        if (!socket.uuid) {
            socket.uuid = crypto.randomUUID();
        }
        console.log('client connected', socket.uuid);
        const userChannel = `user:${socket.uuid}`;
        subscribe(socket, userChannel);
        socket.on('message', (message) => {
            const { type, ...data } = JSON.parse(message);
            if (type === 'subscribe') {
                subscribe(socket, data.channel);
            } else if (type === 'unsubscribe') {
                unsubscribe(socket, data.channel);
            } else if (type === 'publish') {
                publish(data.channel, data.data);
            }
        });
    });
};

const subscribe = (socket, channel) => {
    console.log('subscribe', channel, socket.uuid);
    if (!subscribers[channel]) {
        subscribers[channel] = [];
    }
    subscribers[channel].push(socket);
    if (!channels[channel]) {
        channels[channel] = {};
    }
    socket.send(JSON.stringify({
        channel,
        data: channels[channel]
    }));
}

const unsubscribe = (socket, channel) => {
    console.log('unsubscribe', channel, socket.uuid);
    if (!subscribers[channel]) {
        return;
    }
    subscribers[channel] = subscribers[channel].filter(subscriber => subscriber.uuid !== socket.uuid);
}

const publish = (channel, data) => {
    console.log('publish', channel, data);
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
