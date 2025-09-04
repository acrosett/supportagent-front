<template>
  <div class="checklist-input">
    <div class="checklist-label">{{ label }}</div>
    <div class="checklist-options">
      <div 
        v-for="(option, id) in options" 
        :key="id" 
        class="checklist-option"
      >
        <input 
          :id="`checklist-${id}`"
          v-model="selectedIds"
          :value="option.id"
          type="checkbox"
          class="checklist-checkbox"
        />
        <label :for="`checklist-${id}`" class="checklist-option-label">
          {{ option.label }}
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ClothesOption, ClothesOptions } from './EditMedia.vue'


interface Props {
  modelValue?: ClothesOption[]
  options: ClothesOptions
  label?: string
}

interface Emits {
  (e: 'update:modelValue', value: ClothesOption[]): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  label: 'Select Options'
})

const emit = defineEmits<Emits>()

const selectedIds = computed({
  get: () => {
    // Extract IDs from the selected ClothesOption objects
    return props.modelValue?.map(item => item.id) || []
  },
  set: (selectedIdArray: string[]) => {
    // Convert selected IDs back to full ClothesOption objects
    const selectedOptions: ClothesOption[] = []
    
    Object.entries(props.options).forEach(([key, option]) => {
      if (selectedIdArray.includes(option.id)) {
        selectedOptions.push(option)
      }
    })
    
    emit('update:modelValue', selectedOptions)
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
