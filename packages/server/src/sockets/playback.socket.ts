import { Server, Socket } from 'socket.io'
import { QueueItem, PlaybackState } from '../types'
import * as queueService from '../services/queue.service'
import { SocketData, ClientToServerEvents, ServerToClientEvents, InterServerEvents } from '../types/socket'
import { getDbClient } from '../config/database'

interface RoomPlaybackState {
  currentTrack: QueueItem | null
  playbackState: 'playing' | 'paused' | 'stopped'
  playbackPosition: number
  playbackStartTime: number | null
  playedTrackIds: Set<string>
}

const roomPlaybackStates = new Map<string, RoomPlaybackState>()

export function getOrCreatePlaybackState(roomId: string): RoomPlaybackState {
  let state = roomPlaybackStates.get(roomId)
  if (!state) {
    state = {
      currentTrack: null,
      playbackState: 'stopped',
      playbackPosition: 0,
      playbackStartTime: null,
      playedTrackIds: new Set(),
    }
    roomPlaybackStates.set(roomId, state)
  }
  return state
}

export function getPlaybackState(roomId: string): PlaybackState {
  const state = roomPlaybackStates.get(roomId)
  if (!state) {
    return {
      currentTrack: null,
      playbackState: 'stopped',
      playbackPosition: 0,
      playbackStartTime: null,
    }
  }

  let position = state.playbackPosition
  if (state.playbackState === 'playing' && state.playbackStartTime) {
    position += (Date.now() - state.playbackStartTime) / 1000
  }

  return {
    currentTrack: state.currentTrack,
    playbackState: state.playbackState,
    playbackPosition: position,
    playbackStartTime: state.playbackStartTime,
  }
}

export function registerPlaybackHandlers(
  io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>,
  socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>
): void {
  socket.on('play', async (payload) => {
    try {
      const userId = socket.data.userId
      const { roomId, position } = payload
      const state = getOrCreatePlaybackState(roomId)

      state.playbackState = 'playing'
      state.playbackStartTime = Date.now()

      if (position !== undefined) {
        state.playbackPosition = position
      }

      console.log('[PLAYBACK STATE]', state);
      console.log('[CURRENT TRACK]', state.currentTrack);

      if (!state.currentTrack) {
        const nextTrack = await queueService.getNextTrack(roomId)
        state.currentTrack = nextTrack
        state.playbackPosition = 0

        if (nextTrack) {
          io.to(roomId).emit('track_changed', { track: nextTrack })
        }
      }

      socket.to(roomId).emit('playback_state', {
        state: 'playing',
        position: state.playbackPosition,
        track: state.currentTrack,
      })
    } catch (error: any) {
      socket.emit('error', { message: error.message || 'Playback failed', code: 'PLAYBACK_ERROR' })
    }
  })

  socket.on('pause', async (payload) => {
    try {
      const { roomId, position } = payload
      const state = getOrCreatePlaybackState(roomId)

      state.playbackState = 'paused'
      state.playbackPosition = position
      state.playbackStartTime = null

      socket.to(roomId).emit('playback_state', {
        state: 'paused',
        position,
        track: state.currentTrack,
      })
    } catch (error: any) {
      socket.emit('error', { message: error.message || 'Pause failed', code: 'PAUSE_ERROR' })
    }
  })

  socket.on('seek', async (payload) => {
    try {
      const { roomId, position } = payload
      const state = getOrCreatePlaybackState(roomId)

      state.playbackPosition = position

      if (state.playbackState === 'playing') {
        state.playbackStartTime = Date.now()
      }

      io.to(roomId).emit('seeked', { position })
    } catch (error: any) {
      socket.emit('error', { message: error.message || 'Seek failed', code: 'SEEK_ERROR' })
    }
  })

  socket.on('next_track', async (payload) => {
    try {
      const userId = socket.data.userId
      const { roomId } = payload

      const db = getDbClient()
      const { data: room } = await db
        .from('rooms')
        .select('host_id')
        .eq('id', roomId)
        .maybeSingle()

      if (!room) {
        socket.emit('error', { message: 'Room not found', code: 'ROOM_NOT_FOUND' })
        return
      }

      if (room.host_id !== userId) {
        socket.emit('error', { message: 'Only the host can skip tracks', code: 'NOT_HOST' })
        return
      }

      const state = getOrCreatePlaybackState(roomId)

      if (state.currentTrack) {
        state.playedTrackIds.add(state.currentTrack.id)
        await queueService.markAsPlayed(state.currentTrack.id)
      }

      const nextTrack = await queueService.getNextTrack(roomId)

      state.currentTrack = nextTrack
      state.playbackState = nextTrack ? 'playing' : 'stopped'
      state.playbackPosition = 0
      state.playbackStartTime = nextTrack ? Date.now() : null

      console.log('[SERVER] Emitting track_changed to room:', roomId);

      const sockets = await io.in(roomId).fetchSockets();

      console.log(
        '[SERVER] Sockets in room:',
        sockets.map((s) => ({
          id: s.id,
          roomId: s.data.roomId,
          userId: s.data.userId,
        }))
      );

      if (nextTrack) {
        io.to(roomId).emit('track_changed', { track: nextTrack });

        io.to(roomId).emit('playback_state', {
          state: 'playing',
          position: 0,
          track: nextTrack,
        });
      } else {
        io.to(roomId).emit('playback_state', {
          state: 'stopped',
          position: 0,
          track: null,
        });
      }
    } catch (error: any) {
      socket.emit('error', { message: error.message || 'Failed to skip track', code: 'SKIP_ERROR' })
    }
  })

  socket.on('request_sync', async (payload) => {
    try {
      const { roomId } = payload
      const state = roomPlaybackStates.get(roomId)

      let position = 0
      let playbackState: 'playing' | 'paused' | 'stopped' = 'stopped'
      let currentTrack: QueueItem | null = null

      if (state) {
        currentTrack = state.currentTrack
        playbackState = state.playbackState

        if (state.playbackState === 'playing' && state.playbackStartTime) {
          position = state.playbackPosition + (Date.now() - state.playbackStartTime) / 1000
        } else {
          position = state.playbackPosition
        }
      } else {
        const queue = await queueService.getQueue(roomId)
        if (queue.length > 0) {
          currentTrack = queue[0]
        }
      }

      socket.emit('sync_state', {
        serverTimestamp: Date.now(),
        playbackState,
        playbackPosition: position,
        currentTrack,
      })
    } catch (error: any) {
      socket.emit('error', { message: error.message || 'Sync failed', code: 'SYNC_ERROR' })
    }
  })
}
