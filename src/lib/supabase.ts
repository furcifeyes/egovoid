import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hazhygxcgithuelpgjgv.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_c6ULCRHxWC1_98dC0vs_g_2kgfb_something'

export const supabase = createClient(supabaseUrl, supabaseKey)
