<template>
  <div class="test-chat-page">
    <ChatInterface />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ 
  layout: 'bare',
  mode: 'spa', // Force SPA mode for this route
  ssr: false, // Disable server-side rendering
  prerender: false, // Disable prerendering
  // Exclude heavy plugins except essential ones
  plugins: ['sp', 'toast'] // Only load super client and toast plugins
})

// Add reCAPTCHA v3 script
useHead({
  script: [
    {
      src: 'https://www.google.com/recaptcha/api.js?render=reCAPTCHA_site_key',
      async: true,
      defer: true
    }
  ]
})
</script>

<style lang="scss">
.test-chat-page {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #fff;
}
</style>
