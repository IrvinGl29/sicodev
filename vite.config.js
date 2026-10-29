import {
  fileURLToPath,
  URL,
} from 'node:url'

import {
  defineConfig,
} from 'vite'

import vue from '@vitejs/plugin-vue'

import {
  VitePWA,
} from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),

    VitePWA({
      /*
       * Actualiza automáticamente
       * el service worker cuando
       * haya una versión nueva.
       */
      registerType: 'autoUpdate',

      /*
       * Archivos que estarán
       * disponibles offline.
       */
      workbox: {
        globPatterns: [
          '**/*.{js,css,html,ico,png,svg,woff,woff2}',
        ],

        /*
         * Para que Vue Router funcione
         * correctamente al abrir rutas
         * estando offline.
         */
        navigateFallback:
          '/index.html',

        cleanupOutdatedCaches:
          true,

        clientsClaim:
          true,

        skipWaiting:
          true,
      },

      /*
       * MANIFEST DE SICODEV
       */
      manifest: {
        name:
          'SICODEV - Sistema de Control de Devoluciones',

        short_name:
          'SICODEV',

        description:
          'Sistema de Control de Devoluciones',

        start_url:
          '/',

        scope:
          '/',

        display:
          'standalone',

        orientation:
          'portrait-primary',

        background_color:
          '#ffffff',

        theme_color:
          '#611232',

        lang:
          'es-MX',

        icons: [
          {
            src:
              '/pwa-192x192.png',

            sizes:
              '192x192',

            type:
              'image/png',

            purpose:
              'any',
          },

          {
            src:
              '/pwa-512x512.png',

            sizes:
              '512x512',

            type:
              'image/png',

            purpose:
              'any',
          },

          {
            src:
              '/pwa-512x512.png',

            sizes:
              '512x512',

            type:
              'image/png',

            purpose:
              'maskable',
          },
        ],
      },
    }),
  ],

  resolve: {
    alias: {
      '@':
        fileURLToPath(
          new URL(
            './src',
            import.meta.url,
          ),
        ),
    },
  },
})
