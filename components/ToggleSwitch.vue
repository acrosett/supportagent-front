<template>
  <div 
    class="toggle-switch" 
    :class="{ 'toggle-switch--disabled': disabled }"
    @click="!disabled && toggle()"
  >
    <div 
      class="toggle-switch__track"
      :class="{ 'toggle-switch__track--active': modelValue }"
    >
      <span 
        class="toggle-switch__label toggle-switch__label--active"
      >
        {{ onLabel }}
      </span>
      <span 
        class="toggle-switch__label"
      >
        {{ offLabel }}
      </span>
      <div 
        class="toggle-switch__thumb"
        :class="{ 'toggle-switch__thumb--active': modelValue }"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean
  disabled?: boolean
  onLabel?: string
  offLabel?: string
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  onLabel: 'ON',
  offLabel: 'OFF'
})

const emit = defineEmits<Emits>()

function toggle() {
  emit('update:modelValue', !props.modelValue)
}
</script>

<style scoped lang="scss">
@use '@/assets/_variables.scss' as *;

.toggle-switch {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  margin-top: 0.5em;

  &--disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
}

.toggle-switch__track {
  position: relative;
  width: 2.8rem;
  height: 1.4rem;
  background-color: #e5e7eb;
  border-radius: 0.7rem;
  transition: all 0.2s ease-in-out;
  border: 2px solid $muted;
  display: flex;
  align-items: center;

  &--active {
    border: 2px solid $brand-2;
    background-color: $brand-2;
  }

  &:hover:not(.toggle-switch--disabled &) {
    box-shadow: 0 0 0 3px rgba($brand-2, 0.1);
  }
}

.toggle-switch__thumb {
  position: absolute;
  top: 50%;
  left: 0.175rem;
  width: 1.05rem;
  height: 1.05rem;
  background-color: white;
  border-radius: 50%;
  transition: all 0.2s ease-in-out;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transform: translateY(-50%);

  &--active {
    left: 1.4rem;
  }
}

.toggle-switch__label {
  position: absolute;
  font-size: 0.525rem;
  font-weight: 600;
  transition: opacity 0.2s ease-in-out 0.1s, color 0.2s ease-in-out 0.1s;
  pointer-events: none;
  top: 50%;
  transform: translateY(-50%);

  &--active {
    left: 0.35rem;
    opacity: 1;
    color: #6b7280;
    
    .toggle-switch__track--active & {
      color: white;
    }
  }

  &:not(&--active) {
    right: 0.35rem;
    opacity: 1;
    color: #6b7280;
  }

  // Hide the OFF label when toggle is active
  .toggle-switch__track--active &:not(&--active) {
    opacity: 0;
  }

  // Hide the ON label when toggle is inactive
  .toggle-switch__track:not(.toggle-switch__track--active) &--active {
    opacity: 0;
  }
}

// Focus styles for accessibility
.toggle-switch:focus-visible {
  outline: none;
  
  .toggle-switch__track {
    box-shadow: 0 0 0 3px rgba($brand-2, 0.2);
  }
}

// Reduced motion support
@media (prefers-reduced-motion: reduce) {
  .toggle-switch__track,
  .toggle-switch__thumb,
  .toggle-switch__label {
    transition: none;
  }
}
</style>
