import { z } from 'zod'

export const addSongSchema = z.object({
  videoId: z
    .string()
    .min(1, 'Video ID is required')
    .max(50, 'Video ID must be at most 50 characters'),
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be at most 200 characters'),
  artist: z
    .string()
    .min(1, 'Artist is required')
    .max(200, 'Artist must be at most 200 characters'),
  duration: z
    .number()
    .int('Duration must be an integer')
    .positive('Duration must be positive'),
  thumbnail: z
    .string()
    .url('Thumbnail must be a valid URL')
    .max(500, 'Thumbnail URL too long')
    .nullable()
    .optional(),
})

export const removeSongSchema = z.object({
  itemId: z.string().uuid('Invalid item ID'),
})

export const reorderQueueSchema = z.object({
  itemId: z.string().uuid('Invalid item ID'),
  newIndex: z
    .number()
    .int('New index must be an integer')
    .min(0, 'New index must be non-negative'),
})

export type AddSongInput = z.infer<typeof addSongSchema>
export type RemoveSongInput = z.infer<typeof removeSongSchema>
export type ReorderQueueInput = z.infer<typeof reorderQueueSchema>
