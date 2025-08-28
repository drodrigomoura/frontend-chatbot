import { createClient } from '@supabase/supabase-js';

// Variables de entorno con prefijo VITE_ se inyectan automáticamente
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

if (
  !import.meta.env.VITE_SUPABASE_URL ||
  !import.meta.env.VITE_SUPABASE_ANON_KEY
) {
  console.warn(
    '⚠️ Supabase environment variables not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env.local file',
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
