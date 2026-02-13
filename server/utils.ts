export const shuffle = (array: any[]) => {
    // Fisher-Yates shuffle
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}


export const waitForConnection = async (socket: WebSocket, timeout = 10000) => {
    const isOpened = () => socket.readyState === WebSocket.OPEN;
    const startTime = Date.now();
    while (socket.readyState === WebSocket.CONNECTING) {
        await new Promise(resolve => setTimeout(resolve, 100));
        if (Date.now() - startTime > timeout) {
            return false;
        }
    }
    return isOpened();
}

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

type Color = 'green' | 'red' | 'yellow' | 'blue' | 'magenta' | 'cyan' | 'white';
const colors = {
    'green': '\x1b[32m',
    'red': '\x1b[31m',
    'yellow': '\x1b[33m',
    'blue': '\x1b[34m',
    'magenta': '\x1b[35m',
    'cyan': '\x1b[36m',
    'white': '\x1b[37m',
}

export const colorFromSeed = (seed: string): Color => {
    // const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % Object.keys(colors).length;
    const numberHash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return Object.keys(colors)[numberHash % Object.keys(colors).length] as Color;
}

export const colorLog = (color: Color, message: string) => {
    console.log(`${colors[color]}${message}\x1b[0m`);
}

export const blobLog = (blob: Record<string, any>) => {
    const { channel, data } = blob;
    const channelSeed = channel.includes(':') ? channel.split(':')[1] : channel;
    const color = colorFromSeed(channelSeed);
    colorLog(color, `[${channel}] ${JSON.stringify(data, null, 2)}`);
}
