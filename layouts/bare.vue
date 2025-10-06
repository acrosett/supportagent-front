<template>
  <main class="main-content">
    <slot />
  </main>
  <Toast />
  <ConfirmPopup />
</template>

<script setup>
import Toast from '~/components/Toast.vue'
import ConfirmPopup from '~/components/ConfirmPopup.vue'

// Get current route
const route = useRoute()

// Add cookie banner script to the head (except on test-chat page) - DISABLED
// useHead({
//   script: computed(() => {
//     // Don't add the script on the test-chat page
//     if (route.path === '/test-chat') {
//       return []
//     }
//     
//     return [
//       // Cookie consent banner
//       {
//         src: '/banner_source.js'
//       }
//     ]
//   })
// })
</script>

<style scoped lang="scss">
@use '~/assets/variables' as *;

.main-content {
  width: 100vw;
  height: 100vh;
  padding: 0;
  margin: 0;
  background: $bg;
  overflow: hidden;
}
</style>
