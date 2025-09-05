<template>
  <main class="main-content">
    <slot />
  </main>
  <Toast />
</template>

<script setup>
import Toast from '~/components/Toast.vue'
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
