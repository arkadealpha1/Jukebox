import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { QueueItem } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getThumbnailUrl(track: QueueItem | null | undefined): string {
  if (track?.thumbnail) return track.thumbnail;
  if (track?.videoId) return `https://img.youtube.com/vi/${track.videoId}/hqdefault.jpg`;
  return '';
}
