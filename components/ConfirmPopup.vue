<template>
  <div v-if="confirmPopup?.state.visible" class="confirm-overlay" @click="handleOverlayClick">
    <div class="confirm-popup" @click.stop>
      <div class="confirm-content">
        <div class="confirm-message">
          {{ confirmPopup?.state.message }}
        </div>
        <div class="confirm-actions">
          <AppButton
            v-if="!confirmPopup?.state.singleButton"
            label="No"
            color="secondary"
            @click="confirmPopup?.reject()"
          />
          <AppButton
            :label="confirmPopup?.state.singleButton ? 'OK' : 'Yes'"
            :color="confirmPopup?.state.singleButton ? 'primary' : 'warning'"
            :margin="confirmPopup?.state.singleButton ? undefined : 'left'"
            @click="confirmPopup?.confirm()"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppButton from '~/components/AppButton.vue'

const confirmPopup = useNuxtApp().$confirmPopup

const handleOverlayClick = () => {
  // For single button mode, clicking overlay acts as OK
  // For confirmation mode, clicking overlay acts as "No"
  if (confirmPopup?.state.singleButton) {
    confirmPopup?.confirm()
  } else {
    confirmPopup?.reject()
  }
}
</script>

<style scoped lang="scss">
@use '~/assets/variables' as *;

.confirm-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.confirm-popup {
  background: $panel;
  border-radius: $radius;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  max-width: 500px;
  width: 100%;
  animation: confirmPopupIn 0.2s ease-out;
}

.confirm-content {
  padding: 2rem;
}

.confirm-message {
  color: $text;
  font-size: 1.1rem;
  line-height: 1.5;
  margin-bottom: 2rem;
  text-align: center;
}

.confirm-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

@keyframes confirmPopupIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@media (max-width: 480px) {
  .confirm-content {
    padding: 1.5rem;
  }
  
  .confirm-message {
    font-size: 1rem;
  }
  
  .confirm-actions {
    flex-direction: column;
    gap: 0.75rem;
  }
}
</style>
