import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './',

  plugins: [
    react(),

    VitePWA({
      registerType: 'autoUpdate',

      includeAssets: [
        'favicon.svg',
        'icon-192.png',
        'icon-512.png',
      ],

      manifest: {
        name: 'Weather or Not',
        short_name: 'Weather',
        description: 'Weather with personality.',
        start_url: '.',
        scope: '.',
        display: 'standalone',
        background_color: '#0f172a',
        theme_color: '#0f172a',

        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },

      workbox: {
        navigateFallback: 'index.html',

        globPatterns: [
          '**/*.{js,css,html,svg,png,woff2}',
        ],

        runtimeCaching: [
          {
            urlPattern:
              /^https:\/\/geocoding-api\.open-meteo\.com\/.*/i,

            handler: 'NetworkFirst',

            options: {
              cacheName: 'open-meteo-geocoding',

              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24,
              },

              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },

          {
            urlPattern:
              /^https:\/\/api\.open-meteo\.com\/.*/i,

            handler: 'NetworkFirst',

            options: {
              cacheName: 'open-meteo-weather',

              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 30,
              },

              cacheableResponse: {
                statuses: [0, 200],
              },

              networkTimeoutSeconds: 8,
            },
          },
        ],
      },
    }),
  ],

  server: {
    host: true,
    port: 5173,
  },

  preview: {
    host: true,
    port: 4173,
  },
});
