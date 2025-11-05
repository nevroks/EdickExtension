import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path';


export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/components': path.resolve(__dirname, './src/components/index.ts'),
      '@/ui': path.resolve(__dirname, './src/components/ui/index.ts'),
    },
  },
  build: {
    outDir: 'build',
    rollupOptions: {
      input: {
        popup: './index.html',
        // options: './options.html',
        // background: './src/background/background.ts',
        // content: './src/content/content.ts',
      },
      output: {
        entryFileNames: (chunkInfo) => {
          // Для background и content скриптов сохраняем как .js
          if (chunkInfo.name === 'background' || chunkInfo.name === 'content') {
            return '[name].js'
          }
          // Для остальных - стандартное именование
          return 'assets/[name]-[hash].js'
        }
      }
    },
  },
});