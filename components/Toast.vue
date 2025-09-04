<template>
  <div v-if="toast?.state.visible" class="toast" :class="toast?.state.type">
    <span>{{ toast?.state.message }}</span>
    <button class="close" @click="toast?.hide()">×</button>
  </div>
</template>
<script setup lang="ts">
const toast = useNuxtApp().$toast
</script>
<style scoped>
.toast {
  position: fixed;
  top: 2em;
  left: 50%;
  transform: translateX(-50%);
  min-width: 220px;
  max-width: 90vw;
  background: #222;
  color: #fff;
  padding: 1em 2em;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.2);
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 1em;
  font-size: 1.1em;
}
.toast.error { background: #c0392b; }
.toast.success { background: #27ae60; }
.toast.warning { background: #f39c12; }
.toast.info { background: #222; }
.close {
  background: none;
  border: none;
  color: #fff;
  font-size: 1.3em;
  cursor: pointer;
}
</style>
