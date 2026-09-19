'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSocket } from '@/providers/socket-provider';
import type {
  PresenceOnlineUsersPayload,
  UserOnlinePayload,
  UserOfflinePayload,
} from '../types/realtime.types';

/**
 * Hook to subscribe to workspace room presence events and track which users are currently online
 */
export function useWorkspacePresence(workspaceId?: string | null) {
  const { socket, isConnected } = useSocket();
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!socket || !isConnected || !workspaceId) {
      return;
    }

    // 1. Join workspace room
    socket.emit('room:join', {
      roomType: 'workspace',
      targetId: workspaceId,
    });

    // 2. Fetch initial list of online users in this workspace
    socket.emit('presence:get_online', { workspaceId });

    // 3. Listen for online users snapshot
    const handleOnlineUsers = (data: PresenceOnlineUsersPayload) => {
      if (data?.workspaceId === workspaceId && Array.isArray(data.onlineUserIds)) {
        setOnlineUserIds(new Set(data.onlineUserIds));
      }
    };

    // 4. Listen for live user coming online
    const handleUserOnline = (data: UserOnlinePayload) => {
      if (data?.userId) {
        setOnlineUserIds((prev) => new Set([...prev, data.userId]));
      }
    };

    // 5. Listen for live user going offline
    const handleUserOffline = (data: UserOfflinePayload) => {
      if (data?.userId) {
        setOnlineUserIds((prev) => {
          const next = new Set(prev);
          next.delete(data.userId);
          return next;
        });
      }
    };

    socket.on('presence:online_users', handleOnlineUsers);
    socket.on('user:online', handleUserOnline);
    socket.on('user:offline', handleUserOffline);

    // Clean up room subscription and listeners on unmount or workspace change
    return () => {
      socket.emit('room:leave', {
        roomType: 'workspace',
        targetId: workspaceId,
      });
      socket.off('presence:online_users', handleOnlineUsers);
      socket.off('user:online', handleUserOnline);
      socket.off('user:offline', handleUserOffline);
    };
  }, [socket, isConnected, workspaceId]);

  const helpers = useMemo(() => {
    return {
      onlineUserIds,
      onlineCount: onlineUserIds.size,
      isUserOnline: (userId?: string | null) => (userId ? onlineUserIds.has(userId) : false),
    };
  }, [onlineUserIds]);

  return helpers;
}
