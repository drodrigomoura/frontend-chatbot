import { existsSync } from 'node:fs';
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import dotenv from 'dotenv';

// En desarrollo usar .env.local, en producción usar variables de entorno del hosting
if (process.env.NODE_ENV !== 'production' && existsSync('.env.local')) {
  dotenv.config({ path: '.env.local' });
}

export default defineConfig({
  plugins: [pluginReact()],
  server: {
    port: process.env.PORT || 3000,
  },
  source: {
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(
        process.env.VITE_SUPABASE_URL,
      ),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(
        process.env.VITE_SUPABASE_ANON_KEY,
      ),
    },
  },
});
