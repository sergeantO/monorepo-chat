import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const connectSocket = (token: string) => {
    if (!socket) {
        socket = io('http://localhost:4000', {
            auth: { token },
            transports: ['websocket']
        });
    }
    return socket;
};

export const getSocket = () => {
    if (!socket) throw new Error('Socket not initialized');
    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};