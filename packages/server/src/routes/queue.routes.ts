import { Router } from 'express'
import * as queueController from '../controllers/queue.controller'
import { authenticate } from '../middleware/auth.middleware'
import { validate } from '../middleware/validate.middleware'
import { addSongSchema, reorderQueueSchema } from '../validators/queue.validator'

const router = Router()

router.get('/:roomId/queue', queueController.getQueue)
router.post('/:roomId/queue', authenticate, validate(addSongSchema), queueController.addSong)
router.delete('/:roomId/queue/:itemId', authenticate, queueController.removeSong)
router.put('/:roomId/queue/reorder', authenticate, validate(reorderQueueSchema), queueController.reorderQueue)

export default router
