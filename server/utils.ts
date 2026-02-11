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