import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

const supabaseUrl = "https://bjqvyoujvjzodtwlqlal.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqcXZ5b3Vqdmp6b2R0d2xxbGFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMjMyMDQsImV4cCI6MjA2OTg5OTIwNH0.BzQ0wpsO2NEXRXxe66F7J2aeSEoKossrIgUyCo7tpJE"

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)