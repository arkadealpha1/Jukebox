import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { getDbClient } from '../config/database'
import { User } from '../types'
import { generateToken } from '../utils/jwt'
import { AppError } from '../middleware/error.middleware'

const SALT_ROUNDS = 12

export async function register(
  username: string,
  email: string,
  password: string
): Promise<{ user: Omit<User, 'password_hash'>; token: string }> {
  const db = getDbClient()

  const { data: existingUser, error: checkError } = await db
    .from('users')
    .select('id')
    .or(`username.eq.${username},email.eq.${email}`)
    .maybeSingle()

  if (checkError) {
    throw new AppError('Database error checking existing user', 500, 'DB_ERROR')
  }

  if (existingUser) {
    throw new AppError('Username or email already taken', 409, 'DUPLICATE_CREDENTIALS')
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)
  const userId = uuidv4()
  const now = new Date().toISOString()

  const { data: user, error: insertError } = await db
    .from('users')
    .insert({
      id: userId,
      username,
      email,
      password_hash: passwordHash,
      avatar_url: null,
      created_at: now,
      updated_at: now,
    })
    .select('id, username, email, avatar_url, created_at, updated_at')
    .single()

  if (insertError || !user) {
    throw new AppError('Failed to create user', 500, 'USER_CREATE_FAILED')
  }

  const token = generateToken({ userId: user.id, role: 'user' })

  return { user, token }
}

export async function login(
  email: string,
  password: string
): Promise<{ user: Omit<User, 'password_hash'>; token: string }> {
  const db = getDbClient()

  const { data: user, error: fetchError } = await db
    .from('users')
    .select('*')
    .eq('email', email.toLowerCase())
    .maybeSingle()

  if (fetchError) {
    throw new AppError('Database error during login', 500, 'DB_ERROR')
  }

  if (!user) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS')
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash)
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS')
  }

  const token = generateToken({ userId: user.id, role: 'user' })

  const { password_hash: _, ...userWithoutPassword } = user

  return { user: userWithoutPassword, token }
}

export async function getUserById(
  id: string
): Promise<Omit<User, 'password_hash'> | null> {
  const db = getDbClient()

  const { data: user, error } = await db
    .from('users')
    .select('id, username, email, avatar_url, created_at, updated_at')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    throw new AppError('Database error fetching user', 500, 'DB_ERROR')
  }

  return user || null
}
