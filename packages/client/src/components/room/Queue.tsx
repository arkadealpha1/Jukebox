'use client';

import { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GripVertical, Trash2, Music, Disc3, ListMusic } from 'lucide-react';
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

function selectionCode(index: number): string {
  const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  const letter = letters[Math.floor(index / 9)] ?? 'Z';
  const number = (index % 9) + 1;

  return `${letter}${number}`;
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
  const code = selectionCode(index);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20, height: 0 }}
      animate={{ opacity: 1, x: 0, height: 'auto' }}
      exit={{ opacity: 0, x: 20, height: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'group relative overflow-hidden rounded-2xl border px-3 py-3 transition-all',
        isCurrent
          ? 'border-jukebox-cyan/55 bg-jukebox-cyan/10 shadow-jukebox-cyan'
          : 'border-jukebox-gold/20 bg-black/30 hover:border-jukebox-gold/45 hover:bg-jukebox-gold/5',
      )}
      draggable={isHost && !isCurrent}
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDragEnd={onDragEnd}
      onDrop={() => onDrop(index)}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-jukebox-gold/35 to-transparent" />

      <div className="flex items-center gap-3">
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-xs font-black tracking-widest',
            isCurrent
              ? 'border-jukebox-cyan/60 bg-jukebox-cyan/15 text-jukebox-cyan'
              : 'border-jukebox-gold/40 bg-jukebox-black/80 text-jukebox-gold',
          )}
        >
          {code}
        </div>

        {isHost && !isCurrent && (
          <div className="shrink-0 cursor-grab text-jukebox-cream/20 transition-colors hover:text-jukebox-gold active:cursor-grabbing">
            <GripVertical className="h-4 w-4" />
          </div>
        )}

        <div className="relative shrink-0">
          <img
            src={getThumbnailUrl(item)}
            alt={item.title}
            className={cn(
              'h-11 w-11 rounded-xl border object-cover',
              isCurrent
                ? 'border-jukebox-cyan/70 shadow-jukebox-cyan'
                : 'border-jukebox-gold/25',
            )}
          />

          {isCurrent && (
            <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border border-jukebox-cyan/60 bg-jukebox-black shadow-jukebox-cyan">
              <Disc3 className="h-3 w-3 animate-spin text-jukebox-cyan [animation-duration:3s]" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p
            className={cn(
              'truncate text-sm font-bold',
              isCurrent ? 'text-jukebox-cream' : 'text-jukebox-cream/85',
            )}
          >
            {item.title}
          </p>

          <p className="mt-0.5 truncate text-[11px] font-semibold uppercase tracking-[0.12em] text-jukebox-cream/35">
            {item.artist}
            {!isCurrent && item.addedBy && item.addedBy !== currentUserId && (
              <span className="text-jukebox-gold/45"> &middot; {item.addedBy}</span>
            )}
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className="text-[10px] font-black tracking-widest text-jukebox-gold/70">
            {formatTime(item.duration)}
          </span>

          {isCurrent && (
            <span className="rounded-full border border-jukebox-cyan/40 bg-jukebox-cyan/10 px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.18em] text-jukebox-cyan">
              Live
            </span>
          )}

          {isHost && !isCurrent && (
            <button
              onClick={() => onRemove(item.id)}
              className="rounded-full p-1 text-jukebox-cream/25 opacity-0 transition-all hover:bg-jukebox-red/10 hover:text-jukebox-red-bright group-hover:opacity-100"
              title="Remove song"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
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
    <div className={cn('flex h-full flex-col bg-jukebox-black/30', className)}>
      <div className="relative border-b border-jukebox-gold/20 px-4 py-4">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-jukebox-cyan/50 to-transparent" />

        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-jukebox-gold/70">
              Song Selector
            </p>

            <h3 className="mt-1 text-sm font-black uppercase tracking-[0.14em] text-jukebox-cream">
              {queue.length > 0 ? (
                <>
                  <span className="text-jukebox-cyan">{queue.length}</span>{' '}
                  song{queue.length !== 1 ? 's' : ''} loaded
                </>
              ) : (
                'Queue'
              )}
            </h3>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-jukebox-gold/40 bg-black/40 shadow-jukebox-gold">
            <ListMusic className="h-5 w-5 text-jukebox-gold" />
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 px-2 py-3">
        {queue.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full jukebox-chrome-button">
              <Music className="h-7 w-7 text-jukebox-black" />
            </div>

            <p className="mt-5 text-[10px] font-black uppercase tracking-[0.3em] text-jukebox-gold/70">
              Empty Selector
            </p>

            <h4 className="mt-2 text-base font-black uppercase tracking-[0.12em] text-jukebox-cream">
              No songs loaded
            </h4>

            <p className="mt-2 max-w-[220px] text-xs leading-5 text-jukebox-cream/40">
              Search and add music to fill the jukebox selection panel.
            </p>
          </motion.div>
        ) : (
          <div ref={scrollRef} className="space-y-2">
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