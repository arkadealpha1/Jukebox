'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, SkipForward, Volume2, VolumeX, Music } from 'lucide-react';
import { usePlayer } from '@/hooks/usePlayer';
import { useSocket } from '@/hooks/useSocket';
import { usePlayerStore } from '@/store/playerStore';
import { useQueueStore } from '@/store/queueStore';
import { useRoomStore } from '@/store/roomStore';
import { useThemeColors } from '@/hooks/useThemeColors';
import { SOCKET_EVENTS } from '@/sockets/events';
import { Button } from '@/components/ui/button';
import { getThumbnailUrl } from '@/lib/utils';
import type { QueueItem } from '@/types';

function formatTime(seconds: number): string {
  if (!seconds || !isFinite(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function Player() {
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [muted, setMuted] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const [seekHover, setSeekHover] = useState<number | null>(null);

  const { socket } = useSocket();
  const { isHost, room } = useRoomStore();
  console.log('[PLAYER isHost]', isHost);
  console.log('[PLAYER room]', room);
  const { currentTrack } = useQueueStore();
  const { playbackState, currentTime, duration, setCurrentTime, setDuration, setPlaybackState } =
    usePlayerStore();

  const {
    loadVideo,
    play,
    pause,
    seekTo,
    isReady,
    getCurrentTime,
    mute: mutePlayer,
    unMute: unMutePlayer,
  } = usePlayer('youtube-player', {
    onEnded: () => {
      if (!isHost) return;

      socket.emit(SOCKET_EVENTS.NEXT_TRACK, {
        roomId: room?.id,
      });
    },
  });

  const { colors } = useThemeColors(getThumbnailUrl(currentTrack) || null);

  useEffect(() => {
    function onPlaybackState(data: { state: string; position: number; track: QueueItem | null }) {
      setCurrentTime(data.position);
      if (data.track?.duration) setDuration(data.track.duration);
      setPlaybackState(data.state as 'playing' | 'paused' | 'stopped');
    }
    function onSeeked(data: { position: number }) {
      setCurrentTime(data.position);
      seekTo(data.position);
    }

    function onTrackChanged(data: { track: QueueItem | null }) {
      console.log('[TRACK CHANGED RECEIVED]', data);

      if (!data.track) return;

      const videoId =
        (data.track as any).videoId ||
        (data.track as any).video_id;

      if (!videoId) {
        console.error('[TRACK CHANGED] No video ID found on track:', data.track);
        return;
      }

      console.log('[CALLING LOAD VIDEO]', videoId);

      loadVideo(videoId);

      console.log('[CALLING PLAY]');

      play();

      if (data.track.duration) {
        setDuration(data.track.duration);
      }
    }

    function onSyncState(data: { playbackPosition: number; playbackState: string }) {
      const localTime = getCurrentTime();
      const drift = Math.abs(localTime - data.playbackPosition);
      if (drift > 2) {
        seekTo(data.playbackPosition);
      }
      setCurrentTime(data.playbackPosition);
      setPlaybackState(data.playbackState as 'playing' | 'paused' | 'stopped' | 'buffering');
    }

    socket.on(SOCKET_EVENTS.PLAYBACK_STATE, onPlaybackState);
    socket.on(SOCKET_EVENTS.SEEKED, onSeeked);
    socket.on(SOCKET_EVENTS.TRACK_CHANGED, onTrackChanged);
    socket.on(SOCKET_EVENTS.SYNC_STATE, onSyncState);

    return () => {
      socket.off(SOCKET_EVENTS.PLAYBACK_STATE, onPlaybackState);
      socket.off(SOCKET_EVENTS.SEEKED, onSeeked);
      socket.off(SOCKET_EVENTS.TRACK_CHANGED, onTrackChanged);
      socket.off(SOCKET_EVENTS.SYNC_STATE, onSyncState);
    };
  }, [socket, seekTo, setCurrentTime, setDuration, setPlaybackState, loadVideo, play, getCurrentTime]);

  const handleEnablePlayback = useCallback(() => {
    setUserInteracted(true);
    if (currentTrack?.videoId && isReady) {
      loadVideo(currentTrack.videoId);
      play();
    } else if (currentTrack?.videoId) {
      loadVideo(currentTrack.videoId);
    }
  }, [currentTrack, isReady, loadVideo, play]);

  const handlePlayPause = useCallback(() => {
    if (!userInteracted) {
      handleEnablePlayback();
      return;
    }
    if (playbackState === 'playing') {
      pause();
      socket.emit(SOCKET_EVENTS.PAUSE, { roomId: room?.id, position: currentTime });
    } else {
      play();
      socket.emit(SOCKET_EVENTS.PLAY, { roomId: room?.id, position: currentTime });
    }
  }, [playbackState, pause, play, socket, room?.id, currentTime, userInteracted, handleEnablePlayback]);

  const handleSeek = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isHost || !progressRef.current || !duration) return;
      const rect = progressRef.current.getBoundingClientRect();
      const fraction = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const time = fraction * duration;
      seekTo(time);
      setCurrentTime(time);
      socket.emit(SOCKET_EVENTS.SEEK, { roomId: room?.id, position: time });
    },
    [isHost, duration, seekTo, setCurrentTime, socket, room?.id],
  );

  const handleSeekHover = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!progressRef.current || !duration) return;
      const rect = progressRef.current.getBoundingClientRect();
      const fraction = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      setSeekHover(fraction * duration);
    },
    [duration],
  );

  const handleSkip = useCallback(() => {
    if (!isHost) return;
    socket.emit(SOCKET_EVENTS.NEXT_TRACK, { roomId: room?.id });
  }, [isHost, socket, room?.id]);

  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      if (next) mutePlayer();
      else unMutePlayer();
      return next;
    });
  }, [mutePlayer, unMutePlayer]);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const isPlaying = playbackState === 'playing';

  if (!currentTrack) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center w-full h-full min-h-[400px] p-8"
      >
        <Music className="w-24 h-24 text-white/20 mb-6" />
        <p className="text-white/40 text-lg font-medium">No track playing</p>
        <p className="text-white/20 text-sm mt-1">Search and add songs to the queue</p>
      </motion.div>
    );
  }

  const accentColor = colors.primary || '#7c3aed';

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex flex-col items-center justify-center p-4 md:p-8 overflow-hidden"
      style={
        {
          '--player-accent': accentColor,
          '--player-glow': `${accentColor}33`,
        } as React.CSSProperties
      }
    >
      {!userInteracted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm cursor-pointer"
          onClick={handleEnablePlayback}
        >
          <motion.div
            whileTap={{ scale: 0.9 }}
            className="flex flex-col items-center gap-3"
          >
            <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Play className="w-10 h-10 text-white ml-1" />
            </div>
            <span className="text-white/80 text-sm font-medium">Tap to Enable Playback</span>
          </motion.div>
        </motion.div>
      )}

      <div className="relative flex flex-col items-center gap-6 w-full max-w-md">
        <div className="relative">
          <motion.div
            className="absolute -inset-4 rounded-full opacity-30 blur-2xl"
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{ backgroundColor: accentColor }}
          />
          <motion.div
            className="relative rounded-2xl overflow-hidden shadow-2xl"
            style={{
              boxShadow: `0 0 40px var(--player-glow), 0 0 80px var(--player-glow)`,
            }}
          >
            <motion.img
              key={currentTrack.videoId}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              src={getThumbnailUrl(currentTrack)}
              alt={currentTrack.title}
              className="w-[300px] h-[300px] md:w-[360px] md:h-[360px] object-cover rounded-2xl"
            />
            <div className="absolute inset-0 rounded-2xl ring-1 ring-white/10" />
          </motion.div>
        </div>

        <div className="text-center w-full max-w-sm space-y-1">
          <motion.h2
            key={currentTrack.videoId}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl md:text-2xl font-bold text-white truncate"
          >
            {currentTrack.title}
          </motion.h2>
          <p className="text-sm text-white/60 truncate">{currentTrack.artist}</p>
        </div>

        <div className="w-full max-w-sm space-y-2">
          <div
            ref={progressRef}
            className="relative h-2 bg-white/10 rounded-full cursor-pointer group"
            onClick={handleSeek}
            onMouseMove={handleSeekHover}
            onMouseLeave={() => setSeekHover(null)}
          >
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{ backgroundColor: accentColor, width: `${progress}%` }}
              layout
            />
            {seekHover !== null && (
              <div
                className="absolute top-0 h-full w-0.5 bg-white/50 -translate-x-1/2"
                style={{ left: `${(seekHover / duration) * 100}%` }}
              />
            )}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
              style={{
                left: `calc(${progress}% - 8px)`,
                boxShadow: `0 0 10px ${accentColor}`,
              }}
            />
          </div>
          <div className="flex justify-between text-xs text-white/40">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            className="text-white/60 hover:text-white hover:bg-white/10"
          >
            {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </Button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handlePlayPause}
            className="w-16 h-16 rounded-full flex items-center justify-center transition-colors"
            style={{ backgroundColor: accentColor }}
          >
            {isPlaying ? (
              <Pause className="w-7 h-7 text-white" />
            ) : (
              <Play className="w-7 h-7 text-white ml-0.5" />
            )}
          </motion.button>

          {isHost && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSkip}
              className="text-white/60 hover:text-white hover:bg-white/10"
            >
              <SkipForward className="w-5 h-5" />
            </Button>
          )}

          {!isHost && <div className="w-10" />}
        </div>
      </div>
    </div>
  );
}
