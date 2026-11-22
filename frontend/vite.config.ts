import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig(({ mode }) => {
  const target = mode === 'student' || mode === 'admin' ? mode : undefined
  return {
    plugins: [react(), {
      name: 'application-entry',
      transformIndexHtml: {
        order: 'pre',
        handler(html) {
          return target ? html.replace('/src/main.tsx', `/src/${target}-main.tsx`) : html
        },
      },
    }],
    build: { outDir: target ? `dist/${target}` : 'dist', emptyOutDir: Boolean(target) },
    server: { port: target === 'admin' ? 5174 : 5173, strictPort: Boolean(target), proxy: { '/api': 'http://localhost:4000' } },
  }
})
