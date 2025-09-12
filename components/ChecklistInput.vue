<template>
  <div class="checklist-input">
    <div class="checklist-label" v-if="label">{{ label }}</div>
    <div class="checklist-options">
      <div 
        v-for="option in options" 
        :key="option.value"
        class="checklist-option"
      >
        <input 
          :id="`checklist-${option.value}`"
          v-model="selectedValues"
          :value="option.value"
          type="checkbox"
          class="checklist-checkbox"
        />
        <label :for="`checklist-${option.value}`" class="checklist-option-label">
          {{ option.label }}
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface ChecklistOption {
  value: any // What will be put in the array
  label: string // What is displayed
}

interface Props {
  modelValue?: any[]
  options: ChecklistOption[]
  label?: string
}

interface Emits {
  (e: 'update:modelValue', value: any[]): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  label: '',
  options: () => []
})

const emit = defineEmits<Emits>()

const selectedValues = computed({
  get: () => {
    // Use modelValue as-is
    return props.modelValue || []
  },
  set: (selectedValueArray: any[]) => {
    // Always return primitive values (simplified for string arrays)
    emit('update:modelValue', selectedValueArray)
  }
})
</script>

<style scoped lang="scss">
@use '~/assets/variables' as *;

.checklist-input {
  .checklist-label {
    font-weight: 600;
    color: $text;
    margin-bottom: 0.75rem;
    font-size: 0.875rem;
  }
  
  .checklist-options {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .checklist-option {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .checklist-checkbox {
    width: 1.2em;
    height: 1.2em;
    accent-color: $brand;
    cursor: pointer;
  }
  
  .checklist-option-label {
    font-size: 0.875rem;
    color: $text;
    cursor: pointer;
    user-select: none;
  }
}
</style>
