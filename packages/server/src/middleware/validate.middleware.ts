import { Request, Response, NextFunction } from 'express'
import { ZodSchema, ZodError } from 'zod'
import { formatError } from '../utils/helpers'

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req.body)
      req.body = parsed
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }))
        res.status(400).json(formatError('Validation failed', 'VALIDATION_ERROR', details))
        return
      }
      next(error)
    }
  }
}
