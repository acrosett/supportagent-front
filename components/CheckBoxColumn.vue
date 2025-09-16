<template>
  <div class="filter-column">
    <h4>{{ title }}</h4>
    <div class="checkbox-options">
      <label 
        v-for="option in options" 
        :key="option.value"
        class="checkbox-label"
        :class="{ 'selected': selectedValue === option.value }"
      >
        <input 
          type="radio" 
          :name="name"
          :value="option.value"
          :checked="selectedValue === option.value"
          @change="handleChange(option.value)"
        />
        <span>{{ option.label }}</span>
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
interface CheckBoxOption {
  value: string
  label: string
}

interface Props {
  title: string
  name: string
  options: CheckBoxOption[]
  modelValue: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'change', value: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const selectedValue = computed(() => props.modelValue)

const handleChange = (value: string) => {
  emit('update:modelValue', value)
  emit('change', value)
}
</script>

<style scoped lang="scss">
@use "~/assets/_variables.scss" as *;

.filter-column {
  h4 {
    margin: 0 0 0.75rem 0;
    color: $text;
    font-size: 0.9rem;
    font-weight: 600;
    border-bottom: 2px solid $brand;
    padding-bottom: 0.25rem;
  }
}

.checkbox-options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.9rem;
  color: $text;
  padding: 0.25rem 0.5rem;
  border-radius: $radius;
  transition: all 0.2s ease;
  
  input[type="radio"] {
    width: 16px;
    height: 16px;
    accent-color: $brand;
    cursor: pointer;
  }
  
  &:hover {
    background: rgba($brand, 0.05);
    color: $brand;
  }
  
  &.selected {
    background: rgba($brand, 0.1);
    color: $brand;
    font-weight: 500;
  }
}
</style>