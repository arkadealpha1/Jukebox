import { z } from 'zod'

export const createRoomSchema = z.object({
  name: z
    .string()
    .max(50, 'Room name must be at most 50 characters')
    .optional(),
})

export const joinRoomSchema = z.object({
  roomCode: z
    .string()
    .length(6, 'Room code must be exactly 6 characters')
    .regex(/^[A-Z0-9]+$/, 'Room code must be alphanumeric'),
  nickname: z
    .string()
    .min(2, 'Nickname must be at least 2 characters')
    .max(20, 'Nickname must be at most 20 characters')
    .regex(/^[a-zA-Z0-9_\s]+$/, 'Nickname can only contain letters, numbers, spaces, and underscores'),
})

export const transferHostSchema = z.object({
  roomId: z.string().uuid('Invalid room ID'),
  newHostId: z.string().uuid('Invalid user ID'),
})

export const endRoomSchema = z.object({
  roomId: z.string().uuid('Invalid room ID'),
})

export type CreateRoomInput = z.infer<typeof createRoomSchema>
export type JoinRoomInput = z.infer<typeof joinRoomSchema>
export type TransferHostInput = z.infer<typeof transferHostSchema>
