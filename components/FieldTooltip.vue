<template>
  <span 
    class="field-tooltip-trigger"
    :class="props.class"
    @mouseenter="showTooltip"
    @mouseleave="hideTooltip"
    @click="toggleTooltip"
    @touchstart.passive="toggleTooltip"
    ref="triggerRef"
  >
    <slot />
  </span>
  
  <Teleport to="body">
    <div 
      v-if="isVisible"
      class="field-tooltip"
      :style="tooltipStyle"
      ref="tooltipRef"
    >
      {{ text }}
      <div class="field-tooltip-arrow" :style="arrowStyle"></div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'

interface Props {
  text: string
  class?: string // Accept class as a prop to avoid the warning
}

const props = defineProps<Props>()

const isVisible = ref(false)
const triggerRef = ref<HTMLElement>()
const tooltipRef = ref<HTMLElement>()
const position = ref({ x: 0, y: 0 })

const showTooltip = async () => {
  if (!triggerRef.value) return
  
  isVisible.value = true
  await nextTick()
  
  updatePosition()
}

const hideTooltip = () => {
  // Check if device supports hover (desktop)
  const supportsHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches
  if (supportsHover) {
    isVisible.value = false
  }
}

const toggleTooltip = (event: Event) => {
  // Check if device supports hover (desktop)
  const supportsHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches
  
  if (!supportsHover) {
    // Mobile/touch device behavior
    if (isVisible.value) {
      isVisible.value = false
    } else {
      showTooltip()
      
      // Auto-hide after 5 seconds
      setTimeout(() => {
        isVisible.value = false
      }, 5000)
    }
    
    // Prevent default touch behavior
    event.preventDefault()
  }
}

const updatePosition = () => {
  if (!triggerRef.value || !tooltipRef.value) return
  
  const triggerRect = triggerRef.value.getBoundingClientRect()
  const tooltipRect = tooltipRef.value.getBoundingClientRect()
  
  // Position above the trigger
  let x = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2)
  let y = triggerRect.top - tooltipRect.height - 8
  
  // Ensure tooltip doesn't go off-screen horizontally
  const padding = 16
  if (x < padding) {
    x = padding
  } else if (x + tooltipRect.width > window.innerWidth - padding) {
    x = window.innerWidth - tooltipRect.width - padding
  }
  
  // If tooltip would go above viewport, show it below instead
  if (y < padding) {
    y = triggerRect.bottom + 8
  }
  
  position.value = { x, y }
}

const tooltipStyle = computed(() => ({
  left: `${position.value.x}px`,
  top: `${position.value.y}px`,
}))

const arrowStyle = computed(() => {
  if (!triggerRef.value) return {}
  
  const triggerRect = triggerRef.value.getBoundingClientRect()
  const arrowX = triggerRect.left + (triggerRect.width / 2) - position.value.x - 6
  
  return {
    left: `${arrowX}px`
  }
})

// Global click handler to close tooltip when clicking outside
const handleGlobalClick = (event: Event) => {
  const target = event.target as HTMLElement
  if (!triggerRef.value?.contains(target) && !tooltipRef.value?.contains(target)) {
    isVisible.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleGlobalClick)
  document.addEventListener('touchstart', handleGlobalClick)
  window.addEventListener('scroll', () => {
    if (isVisible.value) {
      updatePosition()
    }
  })
  window.addEventListener('resize', () => {
    if (isVisible.value) {
      updatePosition()
    }
  })
})

onUnmounted(() => {
  document.removeEventListener('click', handleGlobalClick)
  document.removeEventListener('touchstart', handleGlobalClick)
})
</script>

<style scoped lang="scss">
@use '~/assets/variables' as *;

.field-tooltip-trigger {
  display: inline-block;
  cursor: help;
  margin-left: 0.4em;
}

.field-tooltip {
  position: fixed;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  line-height: 1.5;
  white-space: normal;
  word-wrap: break-word;
  z-index: 999999; // Extremely high z-index
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  pointer-events: none;
  
  // Make tooltip take available space
  width: max-content;
  max-width: min(400px, 90vw);
  min-width: 200px;
  
  @media (max-width: 768px) {
    // On mobile, make it even wider
    max-width: 85vw;
    min-width: 250px;
    font-size: 0.95rem;
    padding: 1rem;
  }
}

.field-tooltip-arrow {
  position: absolute;
  top: 100%;
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid rgba(0, 0, 0, 0.9);
  pointer-events: none;
}
</style>
