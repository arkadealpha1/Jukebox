'use client';

import { useEffect, useState, useCallback } from 'react';
import { socket, connect as socketConnect, disconnect as socketDisconnect } from '@/sockets';

type ConnectionStatus = 'connected' | 'disconnected' | 'connecting';

export function useSocket() {
  const [status, setStatus] = useState<ConnectionStatus>(
    socket.connected ? 'connected' : 'disconnected',
  );

  useEffect(() => {
    function onConnect() {
      setStatus('connected');
    }
    function onDisconnect() {
      setStatus('disconnected');
    }
    function onConnectError() {
      setStatus('disconnected');
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
    };
  }, []);

  const connect = useCallback((token: string, roomId?: string) => {
    setStatus('connecting');
    socketConnect(token, roomId);
  }, []);

  const disconnect = useCallback(() => {
    socketDisconnect();
    setStatus('disconnected');
  }, []);

  // useEffect(() => {
  //   return () => {
  //     socketDisconnect();
  //   };
  // }, []);

  return {
    socket,
    status,
    connect,
    disconnect,
    isConnected: status === 'connected',
  };
}
