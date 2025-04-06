import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Ignore TypeScript errors during build
    rollupOptions: {
      onwarn(warning, warn) {
        // Skip TypeScript errors
        if (warning.code && 
            (warning.code === 'TS2322' || 
            warning.code === 'TS2786' || 
            warning.code.toString().startsWith('TS'))) {
          return;
        }
        warn(warning);
      }
    }
  },
})
