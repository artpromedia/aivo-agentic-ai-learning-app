import { VitePWA } from 'vite-plugin-pwa';
import type { VitePWAOptions } from 'vite-plugin-pwa';

export const pwaConfig: Partial<VitePWAOptions> = {
  registerType: 'autoUpdate',
  includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
  
  manifest: {
    name: 'AIVO Learning - Personalized Education',
    short_name: 'AIVO',
    description: 'Personalized AI learning platform for neurodiverse children',
    theme_color: '#8b5cf6',
    background_color: '#ffffff',
    display: 'standalone',
    orientation: 'portrait',
    scope: '/',
    start_url: '/',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-maskable-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    categories: ['education', 'learning', 'kids'],
    screenshots: [
      {
        src: '/screenshot-1.png',
        sizes: '540x720',
        type: 'image/png',
        label: 'Learning activities',
      },
      {
        src: '/screenshot-2.png',
        sizes: '540x720',
        type: 'image/png',
        label: 'Progress tracking',
      },
    ],
  },

  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,woff,ttf,eot}'],
    
    // Don't cache these files
    globIgnores: ['**/node_modules/**/*', 'sw.js', 'workbox-*.js'],
    
    // Runtime caching strategies
    runtimeCaching: [
      // API calls - Network first, fallback to cache
      {
        urlPattern: /^https:\/\/api\.aivo\.ai\/.*/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'aivo-api-cache',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 60 * 60 * 24, // 24 hours
          },
          networkTimeoutSeconds: 10,
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },
      
      // Static assets - Cache first
      {
        urlPattern: /^https:\/\/cdn\.aivo\.ai\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'aivo-cdn-cache',
          expiration: {
            maxEntries: 500,
            maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },
      
      // Images - Cache first with longer expiration
      {
        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'aivo-images-cache',
          expiration: {
            maxEntries: 200,
            maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },
      
      // Fonts - Cache first with very long expiration
      {
        urlPattern: /\.(?:woff|woff2|ttf|eot)$/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'aivo-fonts-cache',
          expiration: {
            maxEntries: 30,
            maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },
      
      // Videos/Audio - Cache first
      {
        urlPattern: /\.(?:mp4|mp3|wav|ogg)$/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'aivo-media-cache',
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },
    ],
    
    // Skip waiting and claim clients immediately
    skipWaiting: true,
    clientsClaim: true,
    
    // Clean up old caches
    cleanupOutdatedCaches: true,
  },

  devOptions: {
    enabled: false, // Enable for development testing if needed
    type: 'module',
  },
};

export default VitePWA(pwaConfig);
