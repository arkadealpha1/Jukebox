import { Router, Request, Response, NextFunction } from 'express'
import { searchSongs } from '../services/search.service'
import { formatResponse, formatError } from '../utils/helpers'

const router = Router()

router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const query = (req.query.q as string) || ''

    if (!query.trim()) {
      res.status(400).json(formatError('Search query is required', 'QUERY_REQUIRED'))
      return
    }

    if (query.length > 200) {
      res.status(400).json(formatError('Search query too long', 'QUERY_TOO_LONG'))
      return
    }

    const results = await searchSongs(query)
    res.json(formatResponse({ results }))
  } catch (error) {
    next(error)
  }
})

export default router
