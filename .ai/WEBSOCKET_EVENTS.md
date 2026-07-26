# WEBSOCKET_EVENTS.md — Real-Time Gateway Integration

Complete specification for the Socket.IO gateway (`/realtime`), connection handshakes, room subscriptions, and server-to-client event listeners.

---

## 1. Gateway Connection & Authentication

- **Namespace**: `/realtime`
- **Transport**: WebSockets / Polling fallback
- **Handshake Authentication**:
  - `auth.token`: Bearer access token string
  - Alternatively query param `?token=<jwt>` or header `Authorization: Bearer <jwt>`.
- **Automatic Room Join**: Upon successful handshake, client automatically joins private user room `user:<userId>` to receive targeted direct notifications.

---

## 2. Room Subscriptions

Client emits `room:join` and `room:leave` events to subscribe to specific collaboration contexts:

```typescript
// Subscribing to a Board Room
socket.emit('room:join', {
  roomType: 'board', // Allowed: 'workspace' | 'board' | 'task'
  targetId: 'board-uuid-123'
});
```

---

## 3. Server-to-Client Inbound Event Directory

| Event Name | Scope / Room | Payload Shape | Trigger / UI Reaction |
|---|---|---|---|
| `user:online` | `workspace:<wId>` | `{ userId: string, user: { id, name, avatar } }` | Updates workspace presence pill; marks user online |
| `user:offline` | `workspace:<wId>` | `{ userId: string }` | Updates presence pill; marks user offline |
| `task.created` | `board:<bId>` | `{ task: TaskObject, columnId: string }` | Invalidate tasks query; render new card |
| `task.moved` | `board:<bId>` | `{ taskId: string, fromColumnId: string, toColumnId: string, order: number }` | Optimistic reorder card in Kanban column |
| `task.updated` | `board:<bId>` | `{ task: TaskObject }` | Update card title/priority/assignee inline |
| `task.deleted` | `board:<bId>` | `{ taskId: string, columnId: string }` | Remove card from column list |
| `comment.created` | `task:<tId>` | `{ comment: CommentObject, taskId: string }` | Append comment to live comment stream |
| `notification.created` | `user:<uId>` | `{ notification: NotificationObject }` | Increment unread badge; show Sonner toast |

---

## 4. Frontend Socket Integration Hook Pattern (`src/hooks/use-realtime-room.ts`)

```typescript
import { useEffect } from 'react';
import { useSocket } from '@/providers/socket-provider';

export function useRealtimeRoom(roomType: 'workspace' | 'board' | 'task', targetId: string | null) {
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket || !isConnected || !targetId) return;

    socket.emit('room:join', { roomType, targetId });

    return () => {
      socket.emit('room:leave', { roomType, targetId });
    };
  }, [socket, isConnected, roomType, targetId]);
}
```
