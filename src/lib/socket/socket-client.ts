import { io, Socket } from 'socket.io-client';
import {
  useAuthStore,
  getStoredAccessToken,
} from '@/features/auth/stores/use-auth-store';

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  (process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/v1\/?$/, '')
    : 'http://localhost:5000');

let socketInstance: Socket | null = null;

/**
 * Returns the singleton Socket.IO instance.
 * Automatically injects the JWT access token in the auth handshake.
 */
export function getSocket(): Socket {
  if (typeof window === 'undefined') {
    // SSR guard
    return {} as Socket;
  }

  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, {
      autoConnect: false,
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      auth: (cb) => {
        const token =
          useAuthStore.getState().accessToken || getStoredAccessToken();
        cb({ token });
      },
    });

    socketInstance.on('connect_error', (err) => {
      // Avoid console spam in dev when backend socket server is offline
      if (process.env.NODE_ENV === 'development') {
        console.warn('[Socket.IO] Connection notice:', err.message);
      }
    });
  }

  // Ensure connected if authenticated
  const token = useAuthStore.getState().accessToken || getStoredAccessToken();
  if (token && !socketInstance.connected && !socketInstance.active) {
    socketInstance.connect();
  }

  return socketInstance;
}

/**
 * Explicitly disconnects the socket (e.g. on logout)
 */
export function disconnectSocket() {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}
