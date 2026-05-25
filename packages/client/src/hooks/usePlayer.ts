'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { usePlayerStore } from '@/store/playerStore';

let youtubeAPILoadPromise: Promise<void> | null = null;

interface CachedPlayer {
  player: YT.Player | null;
  ready: boolean;
  refCount: number;
}

const playerCache = new Map<string, CachedPlayer>();

declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void;
  }
}

function loadYouTubeAPI(): Promise<void> {
  if (window.YT && window.YT.Player) {
    return Promise.resolve();
  }

  if (youtubeAPILoadPromise) {
    return youtubeAPILoadPromise;
  }

  youtubeAPILoadPromise = new Promise((resolve) => {
    const existingScript = document.querySelector(
      'script[src="https://www.youtube.com/iframe_api"]'
    );

    if (!existingScript) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.async = true;
      document.body.appendChild(tag);
    }

    window.onYouTubeIframeAPIReady = () => {
      resolve();
    };

    const checkYT = setInterval(() => {
      if (window.YT && window.YT.Player) {
        clearInterval(checkYT);
        resolve();
      }
    }, 100);
  });

  return youtubeAPILoadPromise;
}

function cachePlayerRef(
  containerId: string,
  player: YT.Player | null,
  ready: boolean,
): void {
  let entry = playerCache.get(containerId);
  if (!entry) {
    entry = { player: null, ready: false, refCount: 0 };
    playerCache.set(containerId, entry);
  }
  if (player !== null) entry.player = player;
  if (ready) entry.ready = true;
}

export function usePlayer(
  containerId: string = 'youtube-player',
  options?: {
    onEnded?: () => void;
  }
) {
  const playerRef = useRef<YT.Player | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [isReady, setIsReady] = useState(false);

  const {
    setCurrentTime,
    setDuration,
    setPlaybackState,
    reset,
  } = usePlayerStore();

  useEffect(() => {
    let mounted = true;
    let cached = playerCache.get(containerId);

    if (!cached) {
      cached = { player: null, ready: false, refCount: 0 };
      playerCache.set(containerId, cached);
    }
    cached.refCount += 1;

    async function initializePlayer() {
      try {
        await loadYouTubeAPI();

        if (!mounted) return;

        const entry = playerCache.get(containerId);

        if (entry?.player) {
          playerRef.current = entry.player;
          if (entry.ready) setIsReady(true);
          startSyncInterval(entry.player);
          return;
        }

        let container = document.getElementById(containerId);

        if (!container) {
          container = document.createElement('div');
          container.id = containerId;

          container.style.position = 'absolute';
          container.style.left = '-9999px';
          container.style.width = '1px';
          container.style.height = '1px';

          document.body.appendChild(container);
        }

        const cachedEntry = playerCache.get(containerId) || cached!;
        cachedEntry.player = null;
        cachedEntry.ready = false;

        const player = new window.YT.Player(containerId, {
          height: '1',
          width: '1',

          playerVars: {
            autoplay: 0,
            controls: 0,
            modestbranding: 1,
            rel: 0,
            playsinline: 1,
            enablejsapi: 1,
            origin: window.location.origin,
          },

          events: {
            onReady: (event) => {
              if (!mounted) return;

              playerRef.current = event.target;
              (window as any).ytPlayer = event.target;
              cachePlayerRef(containerId, event.target, true);
              setIsReady(true);

              console.log('[YouTube] Player ready');

              startSyncInterval(event.target);
            },

            onStateChange: (event) => {
              if (!mounted) return;

              switch (event.data) {
                case window.YT.PlayerState.PLAYING:
                  setPlaybackState('playing');
                  break;

                case window.YT.PlayerState.PAUSED:
                  setPlaybackState('paused');
                  break;

                case window.YT.PlayerState.BUFFERING:
                  setPlaybackState('buffering');
                  break;

                case window.YT.PlayerState.ENDED:
                  setPlaybackState('stopped');
                  options?.onEnded?.();
                  break;

                case window.YT.PlayerState.CUED:
                  setPlaybackState('stopped');
                  break;

                default:
                  break;
              }
              console.log('[YouTube State]', event.data);
            },

            onError: (error) => {
              console.error('[YouTube] Player error:', error);
            },
          },
        });
        cachedEntry.player = player;
      } catch (err) {
        console.error('[usePlayer] Initialization failed:', err);
      }
    }

    function startSyncInterval(target: YT.Player) {
      if (intervalRef.current) clearInterval(intervalRef.current);

      intervalRef.current = setInterval(() => {
        const p = playerRef.current || target;

        if (!p) return;

        try {
          if (typeof p.getCurrentTime === 'function') {
            setCurrentTime(p.getCurrentTime());
          }

          if (typeof p.getDuration === 'function') {
            setDuration(p.getDuration());
          }
        } catch (err) {
          console.error('[YouTube] Interval sync error:', err);
        }
      }, 1000);
    }

    initializePlayer();

    return () => {
      mounted = false;

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      const entry = playerCache.get(containerId);
      if (entry) {
        entry.refCount -= 1;

        if (entry.refCount <= 0) {
          playerCache.delete(containerId);

          if (entry.player) {
            try {
              entry.player.destroy();
            } catch (err) {
              console.error('[YouTube] Destroy error:', err);
            }
          }
        }
      }

      playerRef.current = null;
      setIsReady(false);
    };
  }, [containerId, reset, setCurrentTime, setDuration, setPlaybackState]);

  const loadVideo = useCallback((videoId: string) => {
    console.log('[LOAD VIDEO FUNCTION]', videoId);
    console.log('[PLAYER REF EXISTS]', !!playerRef.current);

    try {
      playerRef.current?.loadVideoById(videoId);

      console.log('[LOAD VIDEO CALLED]');
    } catch (err) {
      console.error('[YouTube] loadVideo error:', err);
    }
  }, []);

  const play = useCallback(() => {
    console.log('[PLAY FUNCTION]');
    console.log('[PLAYER REF EXISTS]', !!playerRef.current);

    try {
      playerRef.current?.playVideo();

      console.log('[PLAY CALLED]');
    } catch (err) {
      console.error('[YouTube] play error:', err);
    }
  }, []);

  const pause = useCallback(() => {
    try {
      playerRef.current?.pauseVideo();
    } catch (err) {
      console.error('[YouTube] pause error:', err);
    }
  }, []);

  const seekTo = useCallback((seconds: number) => {
    try {
      playerRef.current?.seekTo(seconds, true);
    } catch (err) {
      console.error('[YouTube] seek error:', err);
    }
  }, []);

  const mute = useCallback(() => {
    try {
      playerRef.current?.mute();
    } catch (err) {
      console.error('[YouTube] mute error:', err);
    }
  }, []);

  const unMute = useCallback(() => {
    try {
      playerRef.current?.unMute();
    } catch (err) {
      console.error('[YouTube] unmute error:', err);
    }
  }, []);

  const getCurrentTime = useCallback(() => {
    try {
      return playerRef.current?.getCurrentTime?.() || 0;
    } catch {
      return 0;
    }
  }, []);

  const getDuration = useCallback(() => {
    try {
      return playerRef.current?.getDuration?.() || 0;
    } catch {
      return 0;
    }
  }, []);

  return {
    playerRef,
    isReady,
    loadVideo,
    play,
    pause,
    seekTo,
    mute,
    unMute,
    getCurrentTime,
    getDuration,
  };
}