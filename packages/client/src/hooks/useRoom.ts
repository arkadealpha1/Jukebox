'use client';

import { useEffect, useCallback } from 'react';
import { socket, connect as socketConnect } from '@/sockets';
import { SOCKET_EVENTS } from '@/sockets/events';
import { useAuthStore } from '@/store/authStore';
import { useRoomStore } from '@/store/roomStore';
import type { Room, RoomMember } from '@/types';

export function useRoom(roomId?: string) {
  const token = useAuthStore((s) => s.token);
  const {
    room,
    members,
    isHost,
    setRoom,
    setMembers,
    addMember,
    removeMember,
    setHost,
    leaveRoom: leaveRoomStore,
  } = useRoomStore();

  useEffect(() => {
    if (!roomId || !token) return;

    socketConnect(token, roomId);

    socket.emit(SOCKET_EVENTS.REJOIN_ROOM, { roomId });

    function onUserJoined(member: RoomMember) {
      addMember(member);
    }
    function onUserLeft(data: { userId: string }) {
      removeMember(data.userId);
    }
    function onHostChanged(data: { hostId: string }) {
      setHost(data.hostId);
    }
    function onRoomClosed() {
      leaveRoomStore();
    }

    socket.on(SOCKET_EVENTS.USER_JOINED, onUserJoined);
    socket.on(SOCKET_EVENTS.USER_LEFT, onUserLeft);
    socket.on(SOCKET_EVENTS.HOST_CHANGED, onHostChanged);
    socket.on(SOCKET_EVENTS.ROOM_CLOSED, onRoomClosed);

    return () => {
      socket.off(SOCKET_EVENTS.USER_JOINED, onUserJoined);
      socket.off(SOCKET_EVENTS.USER_LEFT, onUserLeft);
      socket.off(SOCKET_EVENTS.HOST_CHANGED, onHostChanged);
      socket.off(SOCKET_EVENTS.ROOM_CLOSED, onRoomClosed);
    };
  }, [roomId, token]);

  const leaveRoom = useCallback(() => {
    if (room?.id) {
      socket.emit(SOCKET_EVENTS.LEAVE_ROOM, { roomId: room.id });
    }
    leaveRoomStore();
  }, [room?.id, leaveRoomStore]);

  const transferHost = useCallback(
    (newHostId: string) => {
      if (room?.id) {
        socket.emit(SOCKET_EVENTS.TRANSFER_HOST, {
          roomId: room.id,
          newHostId,
        });
      }
    },
    [room?.id],
  );

  return {
    room,
    members,
    isHost,
    leaveRoom,
    transferHost,
  };
}
