'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, Clock, Plus, AlertCircle } from 'lucide-react';
import { searchService } from '@/services/search';
import { useQueue } from '@/hooks/useQueue';
import { useQueueStore } from '@/store/queueStore';
import { useAuthStore } from '@/store/authStore';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { SearchResult } from '@/types';

function getSearchThumbnail(result: SearchResult): string {
  return result.thumbnails?.[0]?.url || `https://img.youtube.com/vi/${result.videoId}/hqdefault.jpg`;
}

function formatDuration(seconds: number): string {
  if (!seconds || !isFinite(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function SearchBar({ className }: { className?: string }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const { addSong, isAddCooldown } = useQueue();
  const queue = useQueueStore((s) => s.queue);
  const user = useAuthStore((s) => s.user);
  const currentUserId = user?.id ?? '';

  const userQueueCount = queue.filter((item) => item.addedBy === currentUserId).length;
  const maxQueueReached = userQueueCount >= 3;

  const performSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setIsOpen(false);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const { results: searchResults } = await searchService.searchSongs(q);
      setResults(searchResults);
      setIsOpen(true);
      setSelectedIndex(-1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      setError(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    debounceRef.current = setTimeout(() => {
      performSearch(query);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, performSearch]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSelect(result: SearchResult) {
    if (maxQueueReached || isAddCooldown) return;
    addSong(
      result.videoId,
      result.title,
      result.artist,
      result.duration,
      getSearchThumbnail(result),
    );
    setQuery('');
    setResults([]);
    setIsOpen(false);
    inputRef.current?.blur();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleSelect(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  }

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (results.length > 0 || isLoading) setIsOpen(true);
          }}
          placeholder="Search for songs..."
          className="pl-9 pr-4 h-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl focus-visible:ring-white/20"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 animate-spin" />
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 z-50 overflow-hidden rounded-xl border border-white/10 bg-black/90 backdrop-blur-2xl shadow-2xl"
          >
            {error ? (
              <div className="flex items-center gap-3 px-4 py-6 text-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            ) : results.length === 0 && !isLoading ? (
              <div className="px-4 py-6 text-center">
                <p className="text-sm text-white/30">No results found</p>
              </div>
            ) : (
              <div className="max-h-[360px] overflow-y-auto py-1">
                {results.map((result, idx) => {
                  const isMaxed = maxQueueReached && !isAddCooldown;
                  const addDisabled = isAddCooldown || maxQueueReached;
                  const thumbnailUrl = getSearchThumbnail(result);

                  return (
                    <motion.button
                      key={result.videoId}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.03 }}
                      onClick={() => handleSelect(result)}
                      disabled={addDisabled}
                      className={cn(
                        'flex items-center gap-3 w-full px-3 py-2.5 text-left transition-colors',
                        selectedIndex === idx
                          ? 'bg-white/10'
                          : 'hover:bg-white/[0.06]',
                        addDisabled && 'opacity-40 cursor-not-allowed',
                      )}
                    >
                      <img
                        src={thumbnailUrl}
                        alt={result.title}
                        className="w-10 h-10 rounded-lg object-cover shrink-0 bg-white/10"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium truncate">{result.title}</p>
                        <p className="text-xs text-white/40 truncate">{result.artist}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-white/30">{formatDuration(result.duration)}</span>
                        {isAddCooldown ? (
                          <span className="text-xs text-yellow-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Wait
                          </span>
                        ) : maxQueueReached ? (
                          <span className="text-xs text-orange-400">Queue full</span>
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                            <Plus className="w-3.5 h-3.5 text-white/60" />
                          </div>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
