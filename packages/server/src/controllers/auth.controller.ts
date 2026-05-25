import { Request, Response, NextFunction } from 'express'
import * as authService from '../services/auth.service'
import { formatResponse, formatError } from '../utils/helpers'

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { username, email, password } = req.body
    const result = await authService.register(username, email, password)
    res.status(201).json(formatResponse(result, 'Registration successful'))
  } catch (error) {
    next(error)
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body
    const result = await authService.login(email, password)
    res.json(formatResponse(result, 'Login successful'))
  } catch (error) {
    next(error)
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json(formatError('Authentication required', 'AUTH_REQUIRED'))
      return
    }

    const user = await authService.getUserById(req.user.userId)
    if (!user) {
      res.status(404).json(formatError('User not found', 'NOT_FOUND'))
      return
    }

    res.json(formatResponse({ user }))
  } catch (error) {
    next(error)
  }
}
