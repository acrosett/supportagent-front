// https://nuxt.com/docs/api/configuration/nuxt-config

import { resolve } from 'path';
import wasm from 'vite-plugin-wasm'
import topLevelAwait from 'vite-plugin-top-level-await'

export default defineNuxtConfig({
  ssr: false, // SPA
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  components: true,
  pages: true,
  modules: [
    '@nuxtjs/i18n'
  ],
  i18n: {
    strategy: 'prefix_except_default',
    defaultLocale: 'en',
    locales: [
      {
        code: 'en',
        name: 'English',
        file: 'en.json'
      },
      {
        code: 'fr', 
        name: 'Français',
        file: 'fr.json'
      },
      // {
      //   code: 'es',
      //   name: 'Español', 
      //   file: 'es.json'
      // },
      // {
      //   code: 'de',
      //   name: 'Deutsch',
      //   file: 'de.json'
      // }
    ],
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
      alwaysRedirect: false,
      fallbackLocale: 'en'
    }
  },
  css: ['~/assets/main.scss', 'highlight.js/styles/github-dark.css' ],
  app: {
    head: {
      link: [
        {
          rel: 'stylesheet',
          href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
        },
        {
          rel: 'icon',
          type: 'image/svg+xml',
          href: '/favicon.svg'
        },
        {
          rel: 'icon',
          type: 'image/x-icon',
          href: '/favicon.ico'
        }
      ]
    }
  },
  build: {
    transpile: ['tslib', 'eicrud_exports']
  },
  runtimeConfig: {
    // Private keys (only available on server-side)
    
    // Public keys (exposed to client-side)
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:3200',
      socketBaseUrl: process.env.NUXT_PUBLIC_SOCKET_BASE_URL || 'ws://localhost:3200',
      appVersion: process.env.APP_VERSION || 'dev'
    }
  },
  typescript: {
    tsConfig: {
      compilerOptions: {
        verbatimModuleSyntax: false,
        strictPropertyInitialization: false,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
      }
    }
  },
  alias: {
    '@eicrud/client': resolve(__dirname, 'node_modules/@eicrud/client/index.js')
  },
  // Route-specific optimizations
  routeRules: {
    // build assets → cache forever
    '/_nuxt/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
    // embed script → short cache (you'll purge on release)
    '/embed.js': { headers: { 'cache-control': 'public, max-age=300, stale-while-revalidate=86400' } },
    // iframe route → short HTML cache + allow embedding
    '/test-chat': {
      headers: {
        'cache-control': 'public, max-age=60',
        ...(process.env.NODE_ENV === 'development' ? {} : { 'content-security-policy': 'frame-ancestors *' }) 

      }
    },
    // landing files (you’ll request /landing/index.html from Nginx)
    '/landing/**': { headers: { 'cache-control': 'public, max-age=60' } },
    // default HTML
    '/**': { headers: { 'cache-control': 'public, max-age=60' } }
  },
  // Chunk splitting configuration
  vite: {
    optimizeDeps: {
      include: ['eicrud_exports/**/*'],
      esbuildOptions: {
        target: 'esnext',
        tsconfigRaw: {
          compilerOptions: {
            experimentalDecorators: true,
            useDefineForClassFields: false
          }
        }
      }
    },
    esbuild: {
      target: 'esnext',
      tsconfigRaw: {
        compilerOptions: {
          experimentalDecorators: true,
          useDefineForClassFields: false
        }
      }
    },
    build: {
      target: 'esnext',
      rollupOptions: {
        output: {
          manualChunks: {
            // Separate chunk for widget components
            'widget': [
              './pages/test-chat.vue',
              './components/TrainingDataPanel.vue'
            ]
          }
        }
      }
    },
    plugins: [
      wasm(),
      topLevelAwait()
    ]
  },

})
