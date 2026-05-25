export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
}

export interface Room {
  id: string;
  roomCode: string;
  hostId: string;
  name: string;
  isActive: boolean;
  currentTrack?: QueueItem;
  createdAt: string;
}

export interface RoomMember {
  id: string;
  userId: string;
  nickname: string;
  isHost: boolean;
  joinedAt: string;
}

export interface QueueItem {
  id: string;
  videoId: string;
  title: string;
  artist: string;
  duration: number;
  thumbnail: string;
  position: number;
  addedBy: string;
  addedAt: string;
}

export type PlaybackState = 'playing' | 'paused' | 'stopped';

export interface PlayerState {
  state: PlaybackState;
  videoId?: string;
  currentTime: number;
  duration: number;
}

export interface SearchResult {
  videoId: string;
  title: string;
  artist: string;
  duration: number;
  thumbnails: { url: string; width: number; height: number }[];
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
}
