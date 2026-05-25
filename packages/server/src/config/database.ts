import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { config } from './index'

let dbClient: SupabaseClient | null = null

export function createDbClient(): SupabaseClient {
  if (dbClient) {
    return dbClient
  }

  const supabaseUrl = config.database.supabaseUrl
  const supabaseKey = config.database.supabaseServiceKey || config.database.supabaseAnonKey

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase URL and key must be provided in environment variables')
  }

  dbClient = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    db: {
      schema: 'public',
    },
  })

  return dbClient
}

export function getDbClient(): SupabaseClient {
  if (!dbClient) {
    return createDbClient()
  }
  return dbClient
}
