'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Play,
  Pause,
  SkipForward,
  Volume2,
  VolumeX,
  Music,
  Disc3,
  Sparkles,
} from 'lucide-react';
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
  const progressRef = useRef<HTMLDivElement>(null);
  const [muted, setMuted] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const [seekHover, setSeekHover] = useState<number | null>(null);

  const { socket } = useSocket();
  const { isHost, room } = useRoomStore();
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
      socket.emit(SOCKET_EVENTS.NEXT_TRACK, { roomId: room?.id });
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
      if (!data.track) return;

      const videoId = (data.track as any).videoId || (data.track as any).video_id;

      if (!videoId) {
        console.error('[TRACK CHANGED] No video ID found on track:', data.track);
        return;
      }

      loadVideo(videoId);
      play();

      if (data.track.duration) setDuration(data.track.duration);
    }

    function onSyncState(data: { playbackPosition: number; playbackState: string }) {
      const localTime = getCurrentTime();
      const drift = Math.abs(localTime - data.playbackPosition);

      if (drift > 2) seekTo(data.playbackPosition);

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

    const videoId = (currentTrack as any)?.videoId || (currentTrack as any)?.video_id;

    if (videoId && isReady) {
      loadVideo(videoId);
      play();
    } else if (videoId) {
      loadVideo(videoId);
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
  const accentColor = colors.primary || '#d6a84f';
  const thumbnailUrl = getThumbnailUrl(currentTrack);

  if (!currentTrack) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex h-full w-full items-center justify-center p-4"
      >
        <div className="jukebox-panel relative flex w-full max-w-2xl flex-col items-center overflow-hidden rounded-3xl p-10 text-center">
          <div className="absolute inset-x-10 top-0 h-1 rounded-full jukebox-tube-red" />

          <div className="flex h-28 w-28 items-center justify-center rounded-full jukebox-chrome-button">
            <Music className="h-12 w-12 text-jukebox-black" />
          </div>

          <p className="font-button mt-6 text-[10px] font-black uppercase tracking-[0.32em] dark:text-jukebox-gold/75 text-jukebox-brass">
            Waiting for Selection
          </p>

          <h2 className="font-heading mt-3 text-3xl font-black uppercase heading-tracking text-jukebox-cream">
            Insert a Song
          </h2>

          <p className="font-body mt-3 max-w-sm text-lg leading-6 text-jukebox-cream/55">
            Search and add a track to light up the jukebox.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <div
      className="relative flex h-full w-full items-center justify-center overflow-hidden p-3 sm:p-5 lg:p-6"
      style={
        {
          '--player-accent': accentColor,
          '--player-glow': `${accentColor}55`,
        } as React.CSSProperties
      }
    >
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute left-1/2 top-1/2 h-[620px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[130px]"
          style={{ backgroundColor: `${accentColor}20` }}
        />
      </div>

      {!userInteracted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 z-50 flex cursor-pointer items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={handleEnablePlayback}
        >
          <motion.div
            whileTap={{ scale: 0.94 }}
            className="jukebox-panel flex max-w-sm flex-col items-center rounded-3xl p-7 text-center"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-full jukebox-chrome-button">
              <Play className="ml-1 h-9 w-9 text-jukebox-black" />
            </div>

            <p className="font-button mt-5 text-[10px] font-black uppercase tracking-[0.3em] text-jukebox-gold/80">
              Power On
            </p>

            <h3 className="font-heading mt-2 text-xl font-black uppercase heading-tracking text-jukebox-cream">
              Tap to Start
            </h3>

            <p className="font-body mt-2 text-sm leading-5 text-jukebox-cream/55">
              Mobile browsers need one tap before the jukebox can play.
            </p>
          </motion.div>
        </motion.div>
      )}

      <div className="relative flex w-full max-w-[760px] flex-col items-center">
        <div className="jukebox-arch-frame relative w-full overflow-hidden px-6 pb-7 pt-12 sm:px-8 lg:px-10">
          <div className="absolute left-1/2 top-5 h-3 w-36 -translate-x-1/2 rounded-full jukebox-tube-gold" />

          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-jukebox-gold/40 bg-black/50">
            <Disc3
              className={`h-6 w-6 text-jukebox-gold ${isPlaying ? 'animate-spin' : ''}`}
              style={{ animationDuration: '4s' }}
            />
          </div>

          <div className="relative mx-auto mt-5 w-full max-w-[620px]">
            <motion.div
              className="absolute -inset-4 rounded-[2rem] opacity-35 blur-2xl"
              animate={{
                scale: [1, 1.04, 1],
                opacity: [0.25, 0.42, 0.25],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              style={{ backgroundColor: accentColor }}
            />

            <motion.div
              className="relative overflow-hidden rounded-3xl border border-jukebox-gold/45 bg-black shadow-jukebox-panel"
              style={{
                boxShadow: `0 0 38px var(--player-glow), 0 0 80px rgba(0,0,0,0.6)`,
              }}
            >
              <motion.img
                key={(currentTrack as any).videoId || (currentTrack as any).video_id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                src={thumbnailUrl}
                alt={currentTrack.title}
                className="aspect-video w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-white/5" />
              <div className="absolute inset-0 ring-1 ring-inset ring-white/10" />
            </motion.div>
          </div>
        </div>

        {/* Mobile controls stay here. Desktop controls move to footer next. */}
        <div className="mt-5 flex w-full max-w-xl flex-col items-center gap-5 lg:hidden">
          <div className="jukebox-display w-full rounded-2xl px-4 py-3 text-center">
            <p className="font-button text-[10px] font-black uppercase tracking-[0.28em] text-jukebox-gold/70">
              Now Spinning
            </p>

            <motion.h2
              key={(currentTrack as any).videoId || (currentTrack as any).video_id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-heading mt-1 truncate text-xl font-black uppercase heading-tracking text-jukebox-cream"
            >
              {currentTrack.title}
            </motion.h2>

            <p className="font-button mt-1 truncate text-xs font-semibold uppercase tracking-[0.16em] text-jukebox-cyan/75">
              {currentTrack.artist}
            </p>
          </div>

          <div className="w-full space-y-3">
            <div
              ref={progressRef}
              className="group relative h-4 cursor-pointer rounded-full jukebox-progress-track"
              onClick={handleSeek}
              onMouseMove={handleSeekHover}
              onMouseLeave={() => setSeekHover(null)}
              title={isHost ? 'Click to seek' : 'Only host can seek'}
            >
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full jukebox-progress-fill"
                style={{ width: `${progress}%` }}
                layout
              />

              {seekHover !== null && (
                <div
                  className="absolute top-1/2 h-5 w-0.5 -translate-x-1/2 -translate-y-1/2 bg-jukebox-cream/70"
                  style={{ left: `${(seekHover / duration) * 100}%` }}
                />
              )}
            </div>

            <div className="font-button flex justify-between text-[10px] font-black uppercase tracking-[0.16em] text-jukebox-cream/45">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMute}
              className="h-16 w-16 rounded-full border border-jukebox-gold/30 bg-black/40 text-jukebox-gold transition-all hover:bg-jukebox-gold/10 hover:text-jukebox-cream"
            >
              {muted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
            </Button>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handlePlayPause}
              className="jukebox-chrome-button flex h-24 w-24 items-center justify-center rounded-full transition-all"
            >
              {isPlaying ? (
                <Pause className="h-10 w-10 text-jukebox-black" />
              ) : (
                <Play className="ml-0.5 h-10 w-10 text-jukebox-black" />
              )}
            </motion.button>

            {isHost ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSkip}
                className="h-16 w-16 rounded-full border border-jukebox-cyan/40 bg-black/40 text-jukebox-cyan transition-all hover:bg-jukebox-cyan/10 hover:text-jukebox-cream"
                title="Next Track"
              >
                <SkipForward className="h-6 w-6" />
              </Button>
            ) : (
              <div className="h-16 w-16" />
            )}
          </div>

          <div className="font-button flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-jukebox-cream/35">
            <Sparkles className="h-3 w-3 text-jukebox-gold/60" />
            {isHost ? 'Host Controls Active' : 'Synced Playback'}
            <Sparkles className="h-3 w-3 text-jukebox-cyan/60" />
          </div>
        </div>
      </div>
    </div>
  );
}