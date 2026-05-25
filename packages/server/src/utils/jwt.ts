import jwt from 'jsonwebtoken'
import { config } from '../config'
import { JwtPayload } from '../types'

export function generateToken(
  payload: Omit<JwtPayload, 'iat' | 'exp'>,
  expiresIn?: string
): string {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: (expiresIn || config.jwt.expiresIn) as any,
  })
}

export function verifyToken(token: string): JwtPayload {
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload
    return decoded
  } catch (error) {
    throw new Error('Invalid or expired token')
  }
}

export function decodeToken(token: string): JwtPayload | null {
  try {
    return jwt.decode(token) as JwtPayload
  } catch {
    return null
  }
}
