import { Request, Response, NextFunction } from 'express'
import { formatError } from '../utils/helpers'
import { config } from '../config'

export class AppError extends Error {
  public statusCode: number
  public code: string

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR') {
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.name = 'AppError'
  }
}

export function errorHandler(
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json(formatError(err.message, err.code))
    return
  }

  console.error(`[ERROR] ${err.message}`, config.isDev ? err.stack : '')

  res.status(500).json(formatError('Internal server error', 'INTERNAL_ERROR'))
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json(formatError('Resource not found', 'NOT_FOUND'))
}
