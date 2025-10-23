<template>
  <div class="app-layout">
    <AppMenu />
    <main class="main-content">
      <slot />
    </main>
  </div>
  <Toast />
  <ConfirmPopup />
</template>

<script setup>
import { onMounted } from 'vue'
import AppMenu from '~/components/AppMenu.vue'
import Toast from '~/components/Toast.vue'
import ConfirmPopup from '~/components/ConfirmPopup.vue'

// Get current route and runtime config
const route = useRoute()
const { $config } = useNuxtApp()

// Add scripts to the head (except on /widget page)
useHead({
  script: computed(() => {
    // Don't add scripts on the widget page
    if (route.path === '/widget') {
      return []
    }
    
    return [
      // Cookie consent banner - DISABLED
      // {
      //   src: '/banner_source.js'
      // },
      // AI Support widget
      {
        src: `${$config.public.cdnBaseUrl}/embed.js`,
        'data-api-token': '68ce983b17ff8a182e27c4c7',
        'data-width': '400px',
        'data-height': '600px',
        'data-position': 'bottom-right',
        'data-welcome-message': '👋 Welcome! How can I help you today?',
        'data-icon': 'message',
        'data-start-open': 'false',
        'data-periodic-bounce': '5sec',
        'data-primary-color': '#667eea',
        'data-secondary-color': '#667eea',
        'data-dark-mode': 'false',
        'data-debug': 'true'
      }
    ]
  })
})

// Set user token when layout loads (except on /widget page)
onMounted(() => {
  // Don't set user token on widget page
  if (route.path === '/widget') {
    return
  }

  // Wait for the widget to be available, then set the user token
  const checkWidget = () => {
    if (window['AISupportWidget'] && typeof window['AISupportWidget'].setUserToken === 'function') {
      // Get the token from your authentication system
      const nuxtApp = useNuxtApp()
      const token = nuxtApp.$sp.user.config.storage?.get(nuxtApp.$sp.user.JWT_STORAGE_KEY);
      console.log('Setting user token for AISupportWidget:', token)
      if (token) {
        window['AISupportWidget'].setUserToken(token)
      }
    } else {
      // Widget not ready yet, try again in 100ms
      setTimeout(checkWidget, 100)
    }
  }
  
  // Start checking for the widget
  checkWidget()
})
</script>

<style scoped lang="scss">
@use '~/assets/variables' as *;

.app-layout {
  display: flex;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  padding: 2rem;
  background: linear-gradient(180deg, rgba(255,255,255,.02), rgba(255,255,255,.0)), $panel;
  border: 1px solid rgba(255,255,255,.06);
  border-radius: $radius;
  margin: 1rem;
  box-shadow: $shadow;
  backdrop-filter: blur(10px);
  overflow-y: auto;
  max-height: 100vh;
}

/* Mobile adjustments */
@media (max-width: 768px) {
  .app-layout {
    flex-direction: column;
    height: 100vh;
  }
  
  .main-content {
    margin: 60px 0.5rem 0.5rem; /* Account for mobile header with smaller margins */
    padding: 1rem;
  }
}

/* Desktop adjustments */
@media (min-width: 769px) {
  .main-content {
    margin-left: 280px; /* Account for sidebar width */
    margin-top: 0;
    margin-right: 0;
    margin-bottom: 0;
  }
}

/* Default styles - can be overridden by component styles */
:where(.main-content h1) {
  color: $brand;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1rem;
  margin-top: 0;
  background: linear-gradient(135deg, $brand 0%, $brand-2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

:where(.main-content h2) {
  color: $brand;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

:where(.main-content p) {
  color: $muted;
  line-height: 1.6;
  margin-bottom: 1rem;
}
</style>