<template>
  <button
    :type="type"
    :class="[
      'app-button',
      `app-button-${color}`,
      `app-button-${margin}`,
      { 'app-button-error': showError },
      { 'app-button-loading': loading },
      { 'app-button-icon': !label },
    ]"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <AppIcon v-if="showBackIcon" name="chevron-left" size="sm" class="app-button-icon-back" />
    <AppIcon v-if="showPlusIcon" name="plus-simple" size="sm" class="app-button-icon-plus" />
    <i v-if="faIconLeft" :class="[
      `fas fa-${faIconLeft}`, 
      'app-button-fa-icon', 
      label ? 'app-button-fa-icon-left' : 'app-button-fa-icon-center'
    ]"></i>
    <span v-if="label">{{ label }}</span>
    <i v-if="faIconRight" :class="[
      `fas fa-${faIconRight}`, 
      'app-button-fa-icon', 
      label ? 'app-button-fa-icon-right' : 'app-button-fa-icon-center'
    ]"></i>
    <span v-if="loading" class="app-button-spinner"></span>
  </button>
</template>

<script setup lang="ts">
interface AppButtonProps {
  label?: string
  color?: 'primary' | 'secondary' | 'error' | 'ok' | 'warning'
  margin?: 'left' | 'right' | 'no-margins' | 'both'
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  loading?: boolean
  showError?: boolean
  showBackIcon?: boolean
  showPlusIcon?: boolean
  faIconLeft?: string
  faIconRight?: string
}

const props = withDefaults(defineProps<AppButtonProps>(), {
  label: '',
  color: 'primary',
  margin: 'right',
  type: 'button',
  disabled: false,
  loading: false,
  showError: false,
  showBackIcon: false,
  showPlusIcon: false,
  faIconLeft: undefined,
  faIconRight: undefined
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<style lang="scss" scoped>
@use "~/assets/_variables.scss" as *;
@use 'sass:color';

.app-button {
  padding: 0.7em 2em;
  border: none;
  border-radius: $radius;
  font-size: 1em;
  font-weight: bold;
  cursor: pointer;
  box-shadow: $shadow;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;

  &.app-button-icon {
    padding: 0.7em 1em;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.app-button-icon-back,
.app-button-icon-plus {
  width: 18px;
  height: 18px;
  stroke-width: 2;
}

// Color variants
.app-button-primary {
  background: $brand;
  color: $bg;
  
  &:hover:not(:disabled) {
    background: $brand-2;
    color: $text;
    transform: translateY(-1px);
  }
}

.app-button-secondary {
  background: $text;
  color: $bg;
  
  &:hover:not(:disabled) {
    background: $ring;
    color: $text;
    transform: translateY(-1px);
  }
}

.app-button-error {
  background: $error;
  color: $bg;
  
  &:hover:not(:disabled) {
    background: $warning;
    color: $text;
    transform: translateY(-1px);
  }
}

.app-button-ok {
  background: $ok;
  color: $bg;
  
  &:hover:not(:disabled) {
    background: color.adjust($ok, $lightness: 10%);
    color: $text;
    transform: translateY(-1px);
  }
}

.app-button-warning {
  background: $warning;
  color: $bg;
  
  &:hover:not(:disabled) {
    background: color.adjust($warning, $lightness: 10%);
    color: $text;
    transform: translateY(-1px);
  }
}

// Margin variants
.app-button-left {
  margin-left: auto;
}

.app-button-right {
  margin-right: auto;
}

.app-button-no-margins {
  margin: 0;
}

.app-button-both {
  margin-left: auto;
  margin-right: auto;
}

// Font Awesome icon styles
.app-button-fa-icon {
  font-size: 0.875em;
  
  &.app-button-fa-icon-left {
    margin-right: 0.5em;
  }
  
  &.app-button-fa-icon-right {
    margin-left: 0.5em;
  }
  
  &.app-button-fa-icon-center {
    margin: 0;
  }
}

// Error state with shake animation
.app-button-error.app-button-error {
  animation: shake 0.6s cubic-bezier(.36,.07,.19,.97) both;
  background: $brand-2 !important;
  box-shadow: $brand-2;
}

@keyframes shake {
  10%, 90% { transform: translateX(-2px); }
  20%, 80% { transform: translateX(4px); }
  30%, 50%, 70% { transform: translateX(-8px); }
  40%, 60% { transform: translateX(8px); }
}

// Loading spinner
.app-button-spinner {
  display: inline-block;
  width: 1em;
  height: 1em;
  border: 2px solid currentColor;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  margin-left: 0.5em;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

// Loading state
.app-button-loading {
  pointer-events: none;
}
</style>
