'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LogOut, AlertCircle, Loader2, Music, Wifi, WifiOff } from 'lucide-react';
import { useSocket } from '@/hooks/useSocket';
import { useRoom } from '@/hooks/useRoom';
import { useQueue } from '@/hooks/useQueue';
import { useAuthStore } from '@/store/authStore';
import { useRoomStore } from '@/store/roomStore';
import { useQueueStore } from '@/store/queueStore';
import { useThemeStore } from '@/store/themeStore';
import { useThemeColors } from '@/hooks/useThemeColors';
import { roomService } from '@/services/room';
import { socket } from '@/sockets';
import { SOCKET_EVENTS } from '@/sockets/events';
import {
  Player,
  Queue,
  SearchBar,
  NowPlaying,
  MemberList,
  HostControls,
  InviteButton,
} from '@/components/room';
import { Button } from '@/components/ui';
import { Skeleton } from '@/components/ui/skeleton';
import { cn, getThumbnailUrl } from '@/lib/utils';
import type { Room, RoomMember, QueueItem } from '@/types';

type PageState = 'loading' | 'error' | 'not-found' | 'ready';

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.id as string;

  const token = useAuthStore((s) => s.token);
  const { isAuthenticated, user } = useAuthStore();
  const { connect, disconnect, isConnected, status } = useSocket();
  const {
    room,
    members,
    isHost,
    setRoom,
    setMembers,
    setIsHost,
    leaveRoom: leaveRoomStore,
  } = useRoomStore();
  const { queue, currentTrack } = useQueueStore();
  const { primaryColor, secondaryColor, accentColor, backgroundColor, surfaceColor, setColors } =
    useThemeStore();

  const [pageState, setPageState] = useState<PageState>('loading');
  const [pageError, setPageError] = useState('');
  const [showMobileQueue, setShowMobileQueue] = useState(false);

  const { colors: themeColors, isExtracting } = useThemeColors(getThumbnailUrl(currentTrack));

  const roomHook = useRoom(roomId);
  const queueHook = useQueue();

  const [socketError, setSocketError] = useState<string | null>(null);

  useEffect(() => {
    function onSocketError(data: { message: string; code?: string }) {
      setSocketError(data.message);
    }
    socket.on(SOCKET_EVENTS.ERROR, onSocketError);
    return () => {
      socket.off(SOCKET_EVENTS.ERROR, onSocketError);
    };
  }, []);

  useEffect(() => {
    if (!roomId) return;
    let cancelled = false;

    async function fetchRoom() {
      try {
        const data = await roomService.getRoom(roomId);
        if (cancelled) return;
        setRoom(data.room);
        setMembers(data.members);

        const myMember = data.members.find((member: any) =>
          member.userId === user?.id ||
          member.user_id === user?.id
        );

        setIsHost(Boolean((myMember as any)?.isHost || (myMember as any)?.is_host));

        setPageState('ready');
      } catch (err) {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : '';
        if (msg.toLowerCase().includes('not found') || msg.toLowerCase().includes('404')) {
          setPageState('not-found');
        } else {
          setPageState('error');
          setPageError(msg || 'Failed to load room');
        }
      }
    }

    fetchRoom();

    return () => {
      cancelled = true;
    };
  }, [roomId, setRoom, setMembers, setIsHost, user?.id]);

  // useEffect(() => {
  //   if (roomId && token) {
  //     connect(token, roomId);
  //   }
  //   return () => {
  //     disconnect();
  //   };
  // }, [roomId, token]);

  useEffect(() => {
    function onRoomClosed() {
      leaveRoomStore();
      router.push('/');
    }

    socket.on(SOCKET_EVENTS.ROOM_CLOSED, onRoomClosed);

    return () => {
      socket.off(SOCKET_EVENTS.ROOM_CLOSED, onRoomClosed);
    };
  }, [router, leaveRoomStore]);

  const thumbnailUrl = getThumbnailUrl(currentTrack);

  useEffect(() => {
    if (thumbnailUrl) {
      setColors({
        primaryColor: themeColors.primary,
        secondaryColor: themeColors.secondary,
        accentColor: themeColors.accent,
        backgroundColor: themeColors.background,
        surfaceColor: themeColors.surface,
      });
    }
  }, [themeColors, thumbnailUrl, setColors]);

  const handleLeaveRoom = useCallback(() => {
    roomHook.leaveRoom();
    disconnect();
    router.push('/');
  }, [roomHook, disconnect, router]);

  const handleRetry = useCallback(() => {
    setPageState('loading');
    setPageError('');
    roomService
      .getRoom(roomId)
      .then((data) => {
        setRoom(data.room);
        setMembers(data.members);

        const myMember = data.members.find((member: any) =>
          member.userId === user?.id ||
          member.user_id === user?.id
        );

        setIsHost(Boolean((myMember as any)?.isHost || (myMember as any)?.is_host));

        setPageState('ready');
      })
      .catch((err) => {
        setPageState('error');
        setPageError(err instanceof Error ? err.message : 'Failed to load room');
      });
  }, [roomId, setRoom, setMembers, setIsHost, user?.id]);

  if (pageState === 'loading') {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <Music className="h-12 w-12 text-purple-400" />
          </motion.div>
          <div className="flex flex-col items-center gap-1">
            <p className="text-lg font-medium text-white">Joining room...</p>
            <p className="text-sm text-gray-400">Connecting to the listening party</p>
          </div>
          <div className="mt-4 flex flex-col gap-3">
            <Skeleton className="h-64 w-80 rounded-2xl bg-white/5 sm:w-96" />
            <Skeleton className="h-12 w-80 rounded-xl bg-white/5 sm:w-96" />
            <Skeleton className="h-8 w-80 rounded-xl bg-white/5 sm:w-96" />
          </div>
        </div>
      </div>
    );
  }

  if (pageState === 'not-found') {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex max-w-md flex-col items-center gap-6 text-center"
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10">
            <AlertCircle className="h-10 w-10 text-red-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Room Not Found</h2>
            <p className="mt-2 text-sm text-gray-400">
              This room doesn&apos;t exist or has been closed.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => router.push('/')}
              className="gap-2 bg-purple-600 text-white hover:bg-purple-500"
            >
              Go Home
            </Button>
            <Button
              variant="outline"
              onClick={handleRetry}
              className="border-white/10 text-white hover:bg-white/10"
            >
              Try Again
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (pageState === 'error') {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex max-w-md flex-col items-center gap-6 text-center"
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10">
            <AlertCircle className="h-10 w-10 text-red-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Something went wrong</h2>
            <p className="mt-2 text-sm text-gray-400">{pageError || 'Unable to load the room.'}</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleRetry}
              className="gap-2 bg-purple-600 text-white hover:bg-purple-500"
            >
              Try Again
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/')}
              className="border-white/10 text-white hover:bg-white/10"
            >
              Go Home
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="relative min-h-[calc(100vh-4rem)] transition-colors duration-700"
      style={
        {
          '--room-primary': primaryColor,
          '--room-secondary': secondaryColor,
          '--room-accent': accentColor,
          '--room-bg': backgroundColor,
          '--room-surface': surfaceColor,
        } as React.CSSProperties
      }
    >
      <div className="hidden lg:flex lg:h-[calc(100vh-4rem)] lg:flex-row">
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <Player />
          </div>
          <div className="flex items-center justify-between border-t border-white/5 px-6 py-3">
            <InviteButton />
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 rounded-full px-2.5 py-1">
                {isConnected ? (
                  <Wifi className="h-3.5 w-3.5 text-green-400" />
                ) : (
                  <WifiOff className="h-3.5 w-3.5 text-red-400" />
                )}
                <span
                  className={cn(
                    'text-[10px] font-medium uppercase tracking-wider',
                    isConnected ? 'text-green-400' : 'text-red-400',
                  )}
                >
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
                {socketError && (
                  <span className="text-[10px] font-medium text-red-400 ml-2">
                    {socketError}
                  </span>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLeaveRoom}
                className="gap-2 text-red-400/50 hover:text-red-400 hover:bg-red-500/10"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-xs">Leave</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="flex w-[380px] flex-col border-l border-white/10 xl:w-[420px]">
          <div className="shrink-0 border-b border-white/5 px-4 py-3">
            <SearchBar />
          </div>
          <div className="flex-1 overflow-hidden">
            <Queue />
          </div>
          <div className="max-h-[200px] shrink-0 border-t border-white/5">
            <MemberList />
          </div>
          {isHost && (
            <div className="shrink-0 border-t border-white/5 px-4 py-2">
              <HostControls />
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:hidden">
        <div className="sticky top-0 z-20 bg-black/80 backdrop-blur-xl px-3 py-2">
          <NowPlaying
            onExpand={() => setShowMobileQueue(!showMobileQueue)}
          />
        </div>

        <div className="flex-1 px-3 py-2">
          <Player />
        </div>

        <div className="sticky bottom-0 z-20 bg-black/80 backdrop-blur-xl border-t border-white/10">
          <div className="px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {isConnected ? (
                    <Wifi className="h-3 w-3 text-green-400" />
                  ) : (
                    <WifiOff className="h-3 w-3 text-red-400" />
                  )}
                  <span className="text-[10px] text-gray-500">
                    {room?.roomCode ?? ''}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <InviteButton />
                {isHost && <HostControls />}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLeaveRoom}
                  className="h-8 gap-1 text-red-400/50 hover:text-red-400 hover:bg-red-500/10"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="text-xs">Leave</span>
                </Button>
              </div>
            </div>
          </div>

          <motion.div
            initial={false}
            animate={{ height: showMobileQueue ? 'auto' : 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden border-t border-white/5"
          >
            <div className="px-3 py-2">
              <SearchBar />
            </div>
            <div className="max-h-[40vh] overflow-y-auto">
              <Queue />
            </div>
            <div className="border-t border-white/5">
              <MemberList />
            </div>
          </motion.div>

          <button
            onClick={() => setShowMobileQueue(!showMobileQueue)}
            className="flex w-full items-center justify-center gap-2 border-t border-white/5 py-2 text-[10px] uppercase tracking-widest text-gray-500 hover:text-gray-300"
          >
            {showMobileQueue ? 'Hide Queue' : `Show Queue (${queue.length})`}
          </button>
        </div>
      </div>
    </div>
  );
}
