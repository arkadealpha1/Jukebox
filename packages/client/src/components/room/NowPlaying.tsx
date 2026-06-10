'use client';

import { motion } from 'framer-motion';
import { Play, Pause, Disc3 } from 'lucide-react';
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
        'jukebox-panel flex items-center gap-3 overflow-hidden rounded-2xl px-3 py-2',
        className,
      )}
      onClick={onExpand}
    >
      <div className="relative shrink-0">
        <motion.img
          key={(currentTrack as any).videoId || (currentTrack as any).video_id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          src={getThumbnailUrl(currentTrack)}
          alt={currentTrack.title}
          className="h-12 w-12 rounded-xl border border-jukebox-gold/35 object-cover"
        />

        <button
          onClick={(e) => {
            e.stopPropagation();
            handlePlayPause();
          }}
          className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/55 opacity-0 transition-opacity hover:opacity-100"
        >
          {playbackState === 'playing' ? (
            <Pause className="h-4 w-4 text-jukebox-gold" />
          ) : (
            <Play className="ml-0.5 h-4 w-4 text-jukebox-gold" />
          )}
        </button>

        {playbackState === 'playing' && (
          <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border border-jukebox-cyan/60 bg-jukebox-black shadow-jukebox-cyan">
            <Disc3 className="h-3 w-3 animate-spin text-jukebox-cyan [animation-duration:3s]" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[9px] font-black uppercase tracking-[0.24em] dark:text-jukebox-gold/65 text-jukebox-brass">
          Now Spinning
        </p>

        <p className="truncate text-sm font-black text-jukebox-cream">
          {currentTrack.title}
        </p>

        <p className="truncate text-[11px] font-semibold uppercase tracking-[0.12em] text-jukebox-cyan/65">
          {currentTrack.artist}
        </p>

        <div className="mt-1 h-1.5 overflow-hidden rounded-full jukebox-progress-track">
          <motion.div
            className="h-full rounded-full jukebox-progress-fill"
            style={{ width: `${progress}%` }}
            layout
          />
        </div>
      </div>

      <span className="shrink-0 rounded-full border border-jukebox-gold/25 bg-black/30 px-2 py-1 text-[10px] font-black tracking-widest text-jukebox-cream/50">
        -{formatTime(remaining)}
      </span>
    </motion.div>
  );
}