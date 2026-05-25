'use client';

import { motion } from 'framer-motion';
import { Play, Pause } from 'lucide-react';
import { useQueueStore } from '@/store/queueStore';
import { usePlayerStore } from '@/store/playerStore';
import { useRoomStore } from '@/store/roomStore';
import { useSocket } from '@/hooks/useSocket';
import { SOCKET_EVENTS } from '@/sockets/events';
import { cn, getThumbnailUrl } from '@/lib/utils';

function formatTime(seconds: number): string {
  if (!seconds || !isFinite(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

interface NowPlayingProps {
  className?: string;
  onExpand?: () => void;
}

export function NowPlaying({ className, onExpand }: NowPlayingProps) {
  const { currentTrack } = useQueueStore();
  const { currentTime, duration, playbackState } = usePlayerStore();
  const { room } = useRoomStore();
  const { socket } = useSocket();

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const remaining = Math.max(0, duration - currentTime);

  if (!currentTrack) return null;

  function handlePlayPause() {
    if (playbackState === 'playing') {
      socket.emit(SOCKET_EVENTS.PAUSE, { roomId: room?.id, currentTime });
    } else {
      socket.emit(SOCKET_EVENTS.PLAY, { roomId: room?.id, currentTime });
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-xl bg-white/5 backdrop-blur-lg border border-white/10',
        className,
      )}
      onClick={onExpand}
    >
      <div className="relative shrink-0">
        <motion.img
          key={currentTrack.videoId}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          src={getThumbnailUrl(currentTrack)}
          alt={currentTrack.title}
          className="w-12 h-12 rounded-lg object-cover"
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            handlePlayPause();
          }}
          className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg opacity-0 hover:opacity-100 transition-opacity"
        >
          {playbackState === 'playing' ? (
            <Pause className="w-4 h-4 text-white" />
          ) : (
            <Play className="w-4 h-4 text-white ml-0.5" />
          )}
        </button>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{currentTrack.title}</p>
        <p className="text-xs text-white/50 truncate">{currentTrack.artist}</p>
        <div className="mt-1 h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-white/40"
            style={{ width: `${progress}%` }}
            layout
          />
        </div>
      </div>

      <span className="text-xs text-white/40 shrink-0">-{formatTime(remaining)}</span>
    </motion.div>
  );
}
