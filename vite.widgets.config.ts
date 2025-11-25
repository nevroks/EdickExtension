import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
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
      // Указываем что React берем из глобальной области
      external: ['react', 'react-dom'],
      output: {
        globals: {
          'react': 'React',
          'react-dom': 'ReactDOM'
        }
      }
    }
  },
})