import { Server, Socket } from 'socket.io'
import * as queueService from '../services/queue.service'
import { getOrCreatePlaybackState } from './playback.socket'
import { SocketData, ClientToServerEvents, ServerToClientEvents, InterServerEvents } from '../types/socket'

export function registerQueueHandlers(
  io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>,
  socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>
): void {
  
  socket.on('add_song', async (payload) => {

    console.log('[ADD SONG EVENT FIRED]');

    console.log('[ADD SONG PAYLOAD]', payload);

    console.log('[SOCKET ROOM ID]', socket.data.roomId);
    console.log('[PAYLOAD ROOM ID]', payload.roomId);
    console.log('[SOCKET ID]', socket.id);

    try {
      const userId = socket.data.userId
      const { roomId, videoId, title, artist, duration, thumbnail } = payload

      await queueService.addSong(roomId, userId, {
        videoId,
        title,
        artist,
        duration,
        thumbnail,
      })

      const state = getOrCreatePlaybackState(roomId)

      console.log('[CURRENT TRACK BEFORE]', state.currentTrack);

      if (!state.currentTrack) {
        console.log('[FETCHING NEXT TRACK]');

        const nextTrack = await queueService.getNextTrack(roomId);

        console.log('[NEXT TRACK RESULT]', nextTrack);

        state.currentTrack = nextTrack;
        state.playbackState = nextTrack ? 'playing' : 'stopped';
        state.playbackPosition = 0;
        state.playbackStartTime = nextTrack ? Date.now() : null;

        if (nextTrack) {
          console.log('[EMITTING TRACK_CHANGED]', nextTrack.video_id);

          io.to(roomId).emit('track_changed', { track: nextTrack });
        } else {
          console.log('[NO NEXT TRACK FOUND]');
        }
      }

      const queue = await queueService.getQueue(roomId)
      io.to(roomId).emit('queue_updated', { queue })

      if (state.currentTrack && state.playbackState === 'playing') {
        io.to(roomId).emit('playback_state', {
          state: 'playing',
          position: state.playbackPosition,
          track: state.currentTrack,
        })
      }
    } catch (error: any) {
      socket.emit('error', { message: error.message || 'Failed to add song', code: 'ADD_SONG_FAILED' })
    }
  })

  socket.on('remove_song', async (payload) => {
    try {
      const userId = socket.data.userId
      const { roomId, itemId } = payload

      await queueService.removeSong(roomId, itemId, userId)

      const queue = await queueService.getQueue(roomId)
      io.to(roomId).emit('queue_updated', { queue })
    } catch (error: any) {
      socket.emit('error', { message: error.message || 'Failed to remove song', code: 'REMOVE_SONG_FAILED' })
    }
  })

  socket.on('reorder_queue', async (payload) => {
    try {
      const userId = socket.data.userId
      const { roomId, itemId, newIndex } = payload

      const queue = await queueService.reorderQueue(roomId, itemId, newIndex, userId)
      io.to(roomId).emit('queue_updated', { queue })
    } catch (error: any) {
      socket.emit('error', { message: error.message || 'Failed to reorder queue', code: 'REORDER_FAILED' })
    }
  })
}
