import { create } from 'zustand';

type PlaybackState = 'playing' | 'paused' | 'stopped' | 'buffering';

interface PlayerState {
  playbackState: PlaybackState;
  currentTime: number;
  duration: number;
  setPlaybackState: (state: PlaybackState) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  reset: () => void;
}

export const usePlayerStore = create<PlayerState>()((set) => ({
  playbackState: 'stopped',
  currentTime: 0,
  duration: 0,

  setPlaybackState: (state) =>
    set({ playbackState: state }),

  setCurrentTime: (time) =>
    set({ currentTime: time }),

  setDuration: (duration) =>
    set({ duration }),

  reset: () =>
    set({
      playbackState: 'stopped',
      currentTime: 0,
      duration: 0,
    }),
}));
