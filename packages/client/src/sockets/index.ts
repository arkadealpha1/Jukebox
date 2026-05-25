import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '@/lib/constants';

export const socket: Socket = io(SOCKET_URL, {
  autoConnect: true,
  transports: ['websocket', 'polling'],
});

export function connect(token: string, roomId?: string): void {
  socket.auth = { token, roomId };
  socket.connect();
}

export function disconnect(): void {
  console.log('[SOCKET DISCONNECT BLOCKED]');
}
