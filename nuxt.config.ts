// https://nuxt.com/docs/api/configuration/nuxt-config

import { resolve } from 'path';

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  components: true,
  pages: true,
  css: ['~/assets/main.scss', 'highlight.js/styles/github-dark.css' ],
  app: {
    head: {
      link: [
        {
          rel: 'stylesheet',
          href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
        }
      ]
    }
  },
  build: {
    transpile: ['tslib']
  },
  runtimeConfig: {
    // Private keys (only available on server-side)
    
    // Public keys (exposed to client-side)
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:3200',
      socketBaseUrl: process.env.NUXT_PUBLIC_SOCKET_BASE_URL || 'ws://localhost:3200'
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
    // Optimize /test-chat for embedding
    '/test-chat': {
      ssr: false, // Disable SSR for widget
      prerender: false, // Disable prerendering
      experimentalNoScripts: false, // Keep scripts but minimize
    }
  },
  // Chunk splitting configuration
  vite: {
    build: {
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
    }
  },
  // Nitro config for static assets and caching
  nitro: {
    routeRules: {
      // Cache widget assets for 1 year
      '/test-chat/**': { 
        headers: { 
          'Cache-Control': 'public, max-age=31536000, immutable' 
        }
      },
      // Cache embed script for 1 day
      '/embed.js': { 
        headers: { 
          'Cache-Control': 'public, max-age=86400',
          'Content-Type': 'application/javascript'
        }
      }
    }
  }
})
