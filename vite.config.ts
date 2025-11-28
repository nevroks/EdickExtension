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
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: './index.html',
        background: './src/background/background.ts',
        content: './src/content/content.ts',
      },
      output: {
        entryFileNames: (chunkInfo) => {
          // Все content scripts и background должны быть в корне
          if (['background', 'content'].includes(chunkInfo.name)) {
            return '[name].js'
          }
          // Для popup - стандартная структура
          return 'assets/[name]-[hash].js'
        },
        assetFileNames: 'assets/[name]-[hash][extname]'
      },
      external: ['chrome']
    },
  },
  optimizeDeps: {
    include: ['socket.io-client']
  }
});