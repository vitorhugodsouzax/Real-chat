import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { getSocket, resetSocket } from './client.js';
import { useAuthStore } from '../store/authStore.js';

export function useSocket(): Socket | null {
  const token = useAuthStore((s) => s.token);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!token) {
      resetSocket();
      setSocket(null);
      return;
    }

    resetSocket();
    const s = getSocket();
    s.connect();
    setSocket(s);

    return () => {
      resetSocket();
    };
  }, [token]);

  return socket;
}
