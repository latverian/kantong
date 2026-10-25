import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { securityHeaders } from './vite.security';

// base './' + HashRouter so the build works on any static host (GitHub Pages subpath included).
export default defineConfig({
  base: './',
  // assetsInlineLimit 0: never inline fonts/images as data: URLs, so the CSP can stay at 'self'
  build: { chunkSizeWarningLimit: 700, assetsInlineLimit: 0 }, // one bundle is fine: everything is precached for offline use
  plugins: [
    react(),
    tailwindcss(),
    securityHeaders(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/apple-touch-icon.png', 'icons/favicon.png'],
      manifest: {
        name: 'Kantong',
        short_name: 'Kantong',
        description: 'Catatan keuangan pribadi Rupiah & NT$',
        lang: 'id',
        start_url: '.',
        scope: '.',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#F4F5F9',
        theme_color: '#F4F5F9',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallback: 'index.html',
      },
    }),
  ],
});
