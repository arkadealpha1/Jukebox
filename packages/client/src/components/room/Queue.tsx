'use client';

import { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GripVertical, Trash2, Music } from 'lucide-react';
import { useQueueStore } from '@/store/queueStore';
import { useRoomStore } from '@/store/roomStore';
import { useQueue } from '@/hooks/useQueue';
import { useAuthStore } from '@/store/authStore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn, getThumbnailUrl } from '@/lib/utils';
import type { QueueItem } from '@/types';

function formatTime(seconds: number): string {
  if (!seconds || !isFinite(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function QueueItemRow({
  item,
  isCurrent,
  isHost,
  currentUserId,
  onRemove,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDrop,
  index,
}: {
  item: QueueItem;
  isCurrent: boolean;
  isHost: boolean;
  currentUserId: string;
  onRemove: (id: string) => void;
  onDragStart: (index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDragEnd: () => void;
  onDrop: (index: number) => void;
  index: number;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20, height: 0 }}
      animate={{ opacity: 1, x: 0, height: 'auto' }}
      exit={{ opacity: 0, x: 20, height: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors group',
        isCurrent
          ? 'bg-white/10 border border-white/10'
          : 'hover:bg-white/[0.04] border border-transparent',
      )}
      draggable={isHost && !isCurrent}
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDragEnd={onDragEnd}
      onDrop={() => onDrop(index)}
    >
      {isHost && !isCurrent && (
        <div className="shrink-0 cursor-grab active:cursor-grabbing text-white/20 hover:text-white/40 transition-colors">
          <GripVertical className="w-4 h-4" />
        </div>
      )}

      <div className="relative shrink-0">
        <img
          src={getThumbnailUrl(item)}
          alt={item.title}
          className={cn(
            'w-10 h-10 rounded-lg object-cover',
            isCurrent && 'ring-2 ring-white/30',
          )}
        />
        {isCurrent && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-white rounded-full" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className={cn('text-sm truncate', isCurrent ? 'text-white font-medium' : 'text-white/80')}>
          {item.title}
        </p>
        <p className="text-xs text-white/40 truncate">
          {item.artist}{' '}
          {!isCurrent && item.addedBy && item.addedBy !== currentUserId && (
            <span className="text-white/20">&middot; {item.addedBy}</span>
          )}
        </p>
      </div>

      <span className="text-xs text-white/30 shrink-0">{formatTime(item.duration)}</span>

      {isCurrent && (
        <span className="text-[10px] uppercase tracking-wider text-green-400 font-medium shrink-0">
          Now Playing
        </span>
      )}

      {isHost && !isCurrent && (
        <button
          onClick={() => onRemove(item.id)}
          className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-white/30 hover:text-red-400"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </motion.div>
  );
}

export function Queue({ className }: { className?: string }) {
  const { queue, currentTrack } = useQueueStore();
  const { isHost } = useRoomStore();
  const currentUserId = useAuthStore((s) => s.user?.id ?? '');
  const { removeSong, reorderQueue } = useQueue();
  const scrollRef = useRef<HTMLDivElement>(null);
  const dragIndexRef = useRef<number | null>(null);

  useEffect(() => {
    if (currentTrack && scrollRef.current) {
      const element = scrollRef.current.querySelector('[data-current="true"]');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentTrack?.id]);

  const handleRemove = useCallback(
    (itemId: string) => {
      removeSong(itemId);
    },
    [removeSong],
  );

  const handleDragStart = useCallback((index: number) => {
    dragIndexRef.current = index;
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
  }, []);

  const handleDragEnd = useCallback(() => {
    dragIndexRef.current = null;
  }, []);

  const handleDrop = useCallback(
    (toIndex: number) => {
      const fromIndex = dragIndexRef.current;
      if (fromIndex === null || fromIndex === toIndex) return;
      const sortedQueue = currentTrack
        ? [currentTrack, ...queue.filter((item) => item.id !== currentTrack.id)]
        : queue;
      const item = sortedQueue[fromIndex];
      if (item) {
        reorderQueue(item.id, toIndex);
      }
      dragIndexRef.current = null;
    },
    [reorderQueue, queue, currentTrack],
  );

  const queueWithoutCurrent = currentTrack
    ? queue.filter((item) => item.id !== currentTrack.id)
    : queue;

  return (
    <div className={cn('flex flex-col h-full', className)}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <h3 className="text-sm font-medium text-white/60">
          {queue.length > 0 ? (
            <span>
              <span className="text-white">{queue.length}</span> song{queue.length !== 1 ? 's' : ''}{' '}
              in queue
            </span>
          ) : (
            'Queue'
          )}
        </h3>
      </div>

      <ScrollArea className="flex-1 px-2 py-2">
        {queue.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <Music className="w-8 h-8 text-white/20" />
            </div>
            <p className="text-white/40 text-sm font-medium">No songs in queue</p>
            <p className="text-white/20 text-xs mt-1">Search and add some music!</p>
          </motion.div>
        ) : (
          <div ref={scrollRef} className="space-y-0.5">
            <AnimatePresence mode="popLayout">
              {currentTrack && (
                <div key={currentTrack.id} data-current="true">
                  <QueueItemRow
                    item={currentTrack}
                    isCurrent
                    isHost={isHost}
                    currentUserId={currentUserId}
                    onRemove={handleRemove}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragEnd={handleDragEnd}
                    onDrop={handleDrop}
                    index={0}
                  />
                </div>
              )}
              {queueWithoutCurrent.map((item, idx) => (
                <QueueItemRow
                  key={item.id}
                  item={item}
                  isCurrent={false}
                  isHost={isHost}
                  currentUserId={currentUserId}
                  onRemove={handleRemove}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDragEnd={handleDragEnd}
                  onDrop={handleDrop}
                  index={idx + 1}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
