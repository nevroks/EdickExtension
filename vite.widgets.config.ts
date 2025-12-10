import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [
    react({
      // Используем автоматический JSX transform, так как React теперь в бандле
      jsxRuntime: 'automatic'
    })
  ],
  define: {
    'process.env.NODE_ENV': JSON.stringify('production')
  },
  resolve: {
    alias: {
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/components': path.resolve(__dirname, './src/components/index.ts'),
      '@/ui': path.resolve(__dirname, './src/components/ui/index.ts'),
      '@/extensionUtils': path.resolve(__dirname, './src/extensionUtils'),
    },
  },
  build: {
    outDir: 'build',
    emptyOutDir: false, // Не очищаем, чтобы не удалить основную сборку
    lib: {
      entry: './src/extensionUtils/widgets/widgets-bundle.ts',
      name: 'EdickExtWidgets',
      formats: ['iife'],
      fileName: 'widgets'
    },
    rollupOptions: {
      // НЕ делаем React external - включаем его в бандл
      // Это позволит react-query работать корректно
      external: [],
      output: {
        // Извлекаем CSS в отдельный файл
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'widgets.css';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    },
    // Включаем извлечение CSS
    cssCodeSplit: false,
    cssMinify: true
  },
})