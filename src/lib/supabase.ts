import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client with service role key for admin operations
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export type Database = {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string
          name: string
          slug: string
          subscription: 'FREE' | 'PRO'
        }
        Insert: {
          id?: string
          name: string
          slug: string
          subscription?: 'FREE' | 'PRO'
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          subscription?: 'FREE' | 'PRO'
        }
      }
      profiles: {
        Row: {
          id: string
          tenant_id: string
          role: 'ADMIN' | 'MEMBER'
          email: string
        }
        Insert: {
          id: string
          tenant_id: string
          role?: 'ADMIN' | 'MEMBER'
          email: string
        }
        Update: {
          id?: string
          tenant_id?: string
          role?: 'ADMIN' | 'MEMBER'
          email?: string
        }
      }
      notes: {
        Row: {
          id: string
          title: string
          content: string | null
          author_id: string
          tenant_id: string
        }
        Insert: {
          id?: string
          title: string
          content?: string | null
          author_id: string
          tenant_id: string
        }
        Update: {
          id?: string
          title?: string
          content?: string | null
          author_id?: string
          tenant_id?: string
        }
      }
    }
  }
}
