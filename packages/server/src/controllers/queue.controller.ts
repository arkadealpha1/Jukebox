import { Request, Response, NextFunction } from 'express'
import * as queueService from '../services/queue.service'
import { formatResponse, formatError } from '../utils/helpers'

export async function addSong(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json(formatError('Authentication required', 'AUTH_REQUIRED'))
      return
    }

    const { roomId } = req.params
    const { videoId, title, artist, duration, thumbnail } = req.body
    const item = await queueService.addSong(roomId, req.user.userId, {
      videoId,
      title,
      artist,
      duration,
      thumbnail,
    })

    res.status(201).json(formatResponse({ item }, 'Song added to queue'))
  } catch (error) {
    next(error)
  }
}

export async function removeSong(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json(formatError('Authentication required', 'AUTH_REQUIRED'))
      return
    }

    const { roomId, itemId } = req.params
    await queueService.removeSong(roomId, itemId, req.user.userId)
    res.json(formatResponse(null, 'Song removed from queue'))
  } catch (error) {
    next(error)
  }
}

export async function reorderQueue(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json(formatError('Authentication required', 'AUTH_REQUIRED'))
      return
    }

    const { roomId } = req.params
    const { itemId, newIndex } = req.body
    const queue = await queueService.reorderQueue(roomId, itemId, newIndex, req.user.userId)
    res.json(formatResponse({ queue }, 'Queue reordered'))
  } catch (error) {
    next(error)
  }
}

export async function getQueue(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { roomId } = req.params
    const queue = await queueService.getQueue(roomId)
    res.json(formatResponse({ queue }))
  } catch (error) {
    next(error)
  }
}
