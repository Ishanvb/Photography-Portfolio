import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          ['babel-plugin-styled-components', {
            displayName: true,
            fileName: false,
          }]
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-redux'],
          'vendor-router': ['react-router-dom'],
          'vendor-redux': ['@reduxjs/toolkit'],
        },
        entryFileNames: 'assets/[name]-[hash].js',
        // The management UI is emitted under /admin-assets/, which
        // middleware.js 404s without a valid session. Nothing outside
        // src/admin/app imports from it, so any chunk containing one of its
        // modules contains only admin code.
        chunkFileNames(chunk) {
          const isAdminApp = (chunk.moduleIds ?? []).some((id) =>
            id.includes('/src/admin/app/')
          );
          return isAdminApp
            ? 'admin-assets/[name]-[hash].js'
            : 'assets/[name]-[hash].js';
        },
      },
    },
    cssCodeSplit: true,
  },
})
