import { io } from 'socket.io-client';

const base = process.env.EXPO_PUBLIC_API_URL?.replace('/api', '') || 'http://10.0.2.2:5000';

export const socket = io(base, {
  transports: ['websocket'],
  autoConnect: false,
});

export function connectSellerSocket(sellerId) {
  if (!sellerId) return;
  socket.auth = { sellerId };
  socket.connect();
  socket.emit('join', sellerId);
}

export function disconnectSellerSocket() {
  if (socket.connected) {
    socket.disconnect();
  }
}
