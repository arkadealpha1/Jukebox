import { create } from 'zustand';
import type { QueueItem } from '@/types';

interface QueueState {
  queue: QueueItem[];
  currentTrack: QueueItem | null;
  setQueue: (queue: QueueItem[]) => void;
  setCurrentTrack: (track: QueueItem | null) => void;
  addItem: (item: QueueItem) => void;
  removeItem: (itemId: string) => void;
  reorder: (fromIndex: number, toIndex: number) => void;
  clearQueue: () => void;
}

export const useQueueStore = create<QueueState>()((set) => ({
  queue: [],
  currentTrack: null,

  setQueue: (queue) =>
    set({ queue }),

  setCurrentTrack: (track) =>
    set({ currentTrack: track }),

  addItem: (item) =>
    set((state) => ({
      queue: [...state.queue, item],
    })),

  removeItem: (itemId) =>
    set((state) => ({
      queue: state.queue.filter((i) => i.id !== itemId),
    })),

  reorder: (fromIndex, toIndex) =>
    set((state) => {
      const queue = [...state.queue];
      const [moved] = queue.splice(fromIndex, 1);
      queue.splice(toIndex, 0, moved);
      return { queue };
    }),

  clearQueue: () =>
    set({ queue: [], currentTrack: null }),
}));
