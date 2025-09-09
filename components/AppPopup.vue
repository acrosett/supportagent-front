<template>
  <Teleport to="body">
    <div v-if="show" class="popup-overlay" @click="handleOverlayClick">
      <div 
        class="popup-container" 
        :class="[
          `popup-size-${size}`,
          { 'popup-fullscreen': fullscreen }
        ]"
        @click.stop
      >
        <div class="popup-header">
          <h3 class="popup-title">{{ title }}</h3>
          <div class="popup-actions">
            <button
              v-if="allowFullscreenToggle"
              class="popup-action-btn"
              @click="toggleFullscreen"
              :aria-label="internalFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'"
            >
              <AppIcon :name="internalFullscreen ? 'close' : 'expand'" size="md" />
            </button>
          <button 
            v-if="showCloseButton"
            class="popup-close" 
            @click="handleClose"
            aria-label="Close popup"
          >
            <AppIcon name="close" size="md" />
          </button>
          </div>
        </div>
        
        <div class="popup-content">
          <slot />
        </div>
        
        <div v-if="$slots.footer" class="popup-footer">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  show: boolean
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  fullscreen?: boolean
  closeOnOverlay?: boolean
  showCloseButton?: boolean
  allowFullscreenToggle?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  size: 'md',
  fullscreen: false,
  closeOnOverlay: true,
  showCloseButton: true
  allowFullscreenToggle: true
})

const emit = defineEmits<{
  close: []
  'update:fullscreen': [boolean]
}>()

const handleClose = () => {
  emit('close')
}

const handleOverlayClick = () => {
  if (props.closeOnOverlay) {
    handleClose()
  }
}

// Close on escape key
onMounted(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && props.show) {
      handleClose()
    }
  }
  document.addEventListener('keydown', handleEscape)
  
  onUnmounted(() => {
    document.removeEventListener('keydown', handleEscape)
  })
})

// Prevent body scroll when popup is open
watch(() => props.show, (newShow) => {
  if (newShow) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

onUnmounted(() => {
  document.body.style.overflow = ''
})
</script>

<style scoped lang="scss">
@use '~/assets/variables' as *;

.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
  padding: 1rem;
}

.popup-container {
  background: $panel;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
}

.popup-size-sm {
  width: 100%;
  max-width: 400px;
}

.popup-size-md {
  width: 100%;
  max-width: 600px;
}

.popup-size-lg {
  width: 100%;
  max-width: 800px;
}

.popup-size-xl {
  width: 100%;
}

.popup-fullscreen {
  width: 100vw !important;
  height: 100vh !important;
  max-width: none !important;
  max-height: none !important;
  border-radius: 0 !important;
  margin: 0 !important;
}

.popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 1.5rem 0 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  margin-bottom: 0;
  padding-bottom: 1rem;
}

.popup-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: $text;
  margin: 0;
}

.popup-close {
  background: none;
  border: none;
  color: $muted;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 20px;
    height: 20px;
    stroke-width: 2;
  }
  
  &:hover {
    background: rgba($brand, 0.1);
    color: $brand;
  }
}

.popup-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.popup-footer {
  padding: 1rem 1.5rem 1.5rem 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba($panel, 0.8);
  backdrop-filter: blur(8px);
}

// Mobile responsive
@media (max-width: 768px) {
  .popup-overlay {
    padding: 0.5rem;
  }
  
  .popup-container {
    border-radius: 8px;
  }
  
  .popup-size-sm,
  .popup-size-md,
  .popup-size-lg,
  .popup-size-xl {
    width: 100%;
    max-width: none;
  }
  
  .popup-header,
  .popup-content,
  .popup-footer {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}
</style>
