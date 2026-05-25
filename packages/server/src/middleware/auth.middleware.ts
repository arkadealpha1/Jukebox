import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../utils/jwt'
import { formatError } from '../utils/helpers'
import { AuthRequest } from '../types'

declare global {
  namespace Express {
    interface Request {
      user?: AuthRequest
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    res.status(401).json(formatError('Authentication required', 'AUTH_REQUIRED'))
    return
  }

  const parts = authHeader.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    res.status(401).json(formatError('Invalid authorization header format', 'INVALID_AUTH_FORMAT'))
    return
  }

  const token = parts[1]

  try {
    const decoded = verifyToken(token)
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    }
    next()
  } catch (error) {
    res.status(401).json(formatError('Invalid or expired token', 'TOKEN_INVALID'))
  }
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    next()
    return
  }

  const parts = authHeader.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    next()
    return
  }

  const token = parts[1]

  try {
    const decoded = verifyToken(token)
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    }
  } catch {
    // Token invalid, continue without user
  }

  next()
}
