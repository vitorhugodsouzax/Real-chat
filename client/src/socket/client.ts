import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore.js';

const SOCKET_URL = import.meta.env.VITE_API_URL as string;

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (socket) return socket;

  const token = useAuthStore.getState().token;
  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket'],
    autoConnect: false,
  });
  return socket;
}

export function resetSocket() {
  socket?.disconnect();
  socket = null;
}
