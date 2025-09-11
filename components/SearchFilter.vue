<template>
  <div class="search-filter">
    <!-- Header -->
    <div class="search-filter-header">
      <h3 v-if="title" class="search-filter-title">{{ title }}</h3>
      <div class="search-filter-actions">
        <AppButton
          v-if="showRefresh"
          label="Refresh"
          color="secondary"
          @click="handleRefresh"
        />
        <AppButton
          v-if="showClear"
          label="Clear"
          color="secondary"
          @click="handleClear"
        />
      </div>
    </div>

    <!-- Text Search -->
    <div v-if="showTextSearch" class="search-filter-text">
      <div class="search-input-wrapper">
        <AppIcon name="search" size="sm" class="search-icon" />
        <input
          v-model="textSearch"
          type="text"
          :placeholder="textSearchPlaceholder"
          class="search-input"
          @input="handleTextSearch"
        />
        <button
          v-if="textSearch"
          type="button"
          class="search-clear-btn"
          @click="clearTextSearch"
        >
          <AppIcon name="close" size="sm" />
        </button>
      </div>
    </div>

    <!-- Filter Fields -->
    <div class="search-filter-fields">
      <div
        v-for="field in visibleFields"
        :key="field.key"
        class="search-filter-field"
        :class="`search-filter-field--${field.inputType}`"
      >
        <label :for="`filter-${field.key}`" class="search-filter-label">
          {{ field.label }}
        </label>

        <!-- Boolean checkbox -->
        <div v-if="field.inputType === 'checkbox'" class="search-filter-checkbox-group">
          <label class="search-filter-checkbox">
            <input
              type="checkbox"
              :checked="filters[field.key] === true"
              @change="handleBooleanFilter(field.key, 'true', $event)"
            />
            <span>True</span>
          </label>
          <label class="search-filter-checkbox">
            <input
              type="checkbox"
              :checked="filters[field.key] === false"
              @change="handleBooleanFilter(field.key, 'false', $event)"
            />
            <span>False</span>
          </label>
        </div>

        <!-- Enum/Select dropdown -->
        <select
          v-else-if="field.selectOptions"
          v-model="filters[field.key]"
          :id="`filter-${field.key}`"
          class="search-filter-select"
          @change="handleFilterChange"
        >
          <option value="">All {{ field.label }}</option>
          <option
            v-for="option in field.selectOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>

        <!-- Date range inputs -->
        <div v-else-if="field.inputType === 'date'" class="search-filter-date-range">
          <input
            v-model="filters[`${field.key}_from`]"
            type="date"
            :id="`filter-${field.key}-from`"
            class="search-filter-input search-filter-date"
            placeholder="From"
            @change="handleFilterChange"
          />
          <span class="search-filter-date-separator">to</span>
          <input
            v-model="filters[`${field.key}_to`]"
            type="date"
            :id="`filter-${field.key}-to`"
            class="search-filter-input search-filter-date"
            placeholder="To"
            @change="handleFilterChange"
          />
        </div>

        <!-- Number range inputs -->
        <div v-else-if="field.inputType === 'number'" class="search-filter-number-range">
          <input
            v-model="filters[`${field.key}_min`]"
            type="number"
            :id="`filter-${field.key}-min`"
            class="search-filter-input search-filter-number"
            placeholder="Min"
            @change="handleFilterChange"
          />
          <span class="search-filter-number-separator">to</span>
          <input
            v-model="filters[`${field.key}_max`]"
            type="number"
            :id="`filter-${field.key}-max`"
            class="search-filter-input search-filter-number"
            placeholder="Max"
            @change="handleFilterChange"
          />
        </div>

        <!-- Text input with contains/equals options -->
        <div v-else class="search-filter-text-field">
          <select
            v-model="filters[`${field.key}_operator`]"
            class="search-filter-operator"
            @change="handleFilterChange"
          >
            <option value="contains">Contains</option>
            <option value="equals">Equals</option>
            <option value="startsWith">Starts with</option>
            <option value="endsWith">Ends with</option>
          </select>
          <input
            v-model="filters[field.key]"
            :type="field.inputType"
            :id="`filter-${field.key}`"
            class="search-filter-input"
            :placeholder="`Filter by ${field.label.toLowerCase()}`"
            @input="handleFilterChange"
          />
        </div>
      </div>
    </div>

    <!-- Active Filters Summary -->
    <div v-if="hasActiveFilters" class="search-filter-summary">
      <div class="search-filter-summary-header">
        <span class="search-filter-summary-title">Active Filters</span>
        <button type="button" class="search-filter-summary-clear" @click="handleClear">
          Clear All
        </button>
      </div>
      <div class="search-filter-tags">
        <span
          v-for="tag in activeFilterTags"
          :key="tag.key"
          class="search-filter-tag"
        >
          {{ tag.label }}: {{ tag.value }}
          <button
            type="button"
            class="search-filter-tag-remove"
            @click="removeFilter(tag.key)"
          >
            <AppIcon name="close" size="xs" />
          </button>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { getMetadataStorage } from 'class-validator'

export interface FilterFieldOverride<T = any> {
  type?: string;
  label?: string;
  selectOptions?: Array<{ label: string; value: any }>;
  hidden?: boolean;
  operator?: 'contains' | 'equals' | 'startsWith' | 'endsWith';
}

export type FilterOverrideRecord<T = any> = Partial<Record<keyof T, FilterFieldOverride<T>>>;

export interface SearchFilterProps<T = any> {
  entityClass: new () => T;
  fieldOverrides?: FilterOverrideRecord<T>;
  excludeFields?: (keyof T)[];
  includeFields?: (keyof T)[];
  showTextSearch?: boolean;
  textSearchPlaceholder?: string;
  showRefresh?: boolean;
  showClear?: boolean;
  title?: string;
  debounceMs?: number;
}

const props = withDefaults(defineProps<SearchFilterProps>(), {
  showTextSearch: true,
  textSearchPlaceholder: 'Search...',
  showRefresh: true,
  showClear: true,
  debounceMs: 300
})

const emit = defineEmits<{
  'query-change': [query: any]
  'text-search': [text: string]
  'refresh': []
  'clear': []
}>()

// Reactive state
const textSearch = ref('')
const filters = reactive<Record<string, any>>({})
let debounceTimeout: NodeJS.Timeout | null = null

// Get fields from entity class using class-validator metadata
function getFields(cls: any) {
  const meta = getMetadataStorage()
  const rawMetas = meta.getTargetValidationMetadatas(cls, '', false, false)
  const fieldMap: Record<string, { types: string[]; isArray: boolean }> = {}
  
  rawMetas.forEach((m: any) => {
    const name = m.propertyName as string
    if (!fieldMap[name]) fieldMap[name] = { types: [], isArray: false }
    fieldMap[name].types.push(m.name)
    if (m.each === true) fieldMap[name].isArray = true
  })
  
  // Add fields from fieldOverrides that don't have decorators
  if (props.fieldOverrides) {
    Object.keys(props.fieldOverrides).forEach(key => {
      if (!fieldMap[key]) {
        fieldMap[key] = { types: ['isOptional'], isArray: false }
      }
    })
  }
  
  return Object.entries(fieldMap).map(([key, meta]) => {
    const override = props.fieldOverrides?.[key]
    const types = meta.types
    
    // Determine input type
    let inputType = 'text'
    if (types.includes('isInt') || types.includes('isNumber')) inputType = 'number'
    if (types.includes('isBoolean')) inputType = 'checkbox'
    if (types.includes('isEmail')) inputType = 'email'
    if (types.includes('isDate')) inputType = 'date'
    if (types.includes('isEnum')) inputType = 'select'
    if (override?.type) inputType = override.type
    
    // Generate label
    const label = override?.label || key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')
    
    return {
      key,
      inputType,
      label,
      isArray: meta.isArray,
      selectOptions: override?.selectOptions,
      hidden: override?.hidden || false
    }
  })
}

const allFields = computed(() => getFields(props.entityClass))

const visibleFields = computed(() => {
  let fields = allFields.value
  
  // Apply include/exclude filters
  if (props.includeFields) {
    fields = fields.filter(f => props.includeFields!.includes(f.key as any))
  }
  if (props.excludeFields) {
    fields = fields.filter(f => !props.excludeFields!.includes(f.key as any))
  }
  
  // Filter out hidden fields
  fields = fields.filter(f => !f.hidden)
  
  return fields
})

const hasActiveFilters = computed(() => {
  const hasTextSearch = textSearch.value.trim() !== ''
  const hasFilters = Object.keys(filters).some(key => {
    const value = filters[key]
    return value !== null && value !== undefined && value !== ''
  })
  return hasTextSearch || hasFilters
})

const activeFilterTags = computed(() => {
  const tags: Array<{ key: string; label: string; value: string }> = []
  
  // Add text search tag
  if (textSearch.value.trim()) {
    tags.push({
      key: '$text',
      label: 'Search',
      value: textSearch.value
    })
  }
  
  // Add filter tags
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      const field = allFields.value.find(f => f.key === key)
      if (field) {
        let displayValue = value
        if (field.selectOptions) {
          const option = field.selectOptions.find(opt => opt.value === value)
          displayValue = option?.label || value
        } else if (typeof value === 'boolean') {
          displayValue = value ? 'True' : 'False'
        }
        
        tags.push({
          key,
          label: field.label,
          value: String(displayValue)
        })
      }
    }
  })
  
  return tags
})

// Build MongoDB-style query from current filters
const buildQuery = () => {
  const query: any = {}
  
  // Add text search
  if (textSearch.value.trim()) {
    query.$text = { $search: textSearch.value.trim() }
  }
  
  // Add field filters
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      const field = allFields.value.find(f => f.key === key.split('_')[0])
      if (!field) return
      
      const baseKey = field.key
      
      if (field.inputType === 'checkbox' && typeof value === 'boolean') {
        query[baseKey] = value
      } else if (field.inputType === 'date') {
        if (key.endsWith('_from') || key.endsWith('_to')) {
          if (!query[baseKey]) query[baseKey] = {}
          if (key.endsWith('_from')) query[baseKey].$gte = new Date(value)
          if (key.endsWith('_to')) query[baseKey].$lte = new Date(value)
        }
      } else if (field.inputType === 'number') {
        if (key.endsWith('_min') || key.endsWith('_max')) {
          if (!query[baseKey]) query[baseKey] = {}
          if (key.endsWith('_min')) query[baseKey].$gte = Number(value)
          if (key.endsWith('_max')) query[baseKey].$lte = Number(value)
        }
      } else if (field.selectOptions) {
        query[baseKey] = value
      } else {
        // Text fields with operators
        const operator = filters[`${baseKey}_operator`] || 'contains'
        switch (operator) {
          case 'equals':
            query[baseKey] = value
            break
          case 'contains':
            query[baseKey] = { $regex: value, $options: 'i' }
            break
          case 'startsWith':
            query[baseKey] = { $regex: `^${value}`, $options: 'i' }
            break
          case 'endsWith':
            query[baseKey] = { $regex: `${value}$`, $options: 'i' }
            break
        }
      }
    }
  })
  
  return query
}

const emitQueryChange = () => {
  const query = buildQuery()
  emit('query-change', query)
}

const debouncedEmitQueryChange = () => {
  if (debounceTimeout) {
    clearTimeout(debounceTimeout)
  }
  debounceTimeout = setTimeout(() => {
    emitQueryChange()
  }, props.debounceMs)
}

const handleTextSearch = () => {
  emit('text-search', textSearch.value)
  debouncedEmitQueryChange()
}

const handleFilterChange = () => {
  debouncedEmitQueryChange()
}

const handleBooleanFilter = (fieldKey: string, value: string, event: Event) => {
  const target = event.target as HTMLInputElement
  const boolValue = value === 'true'
  
  if (target.checked) {
    // Uncheck the other option and set this one
    filters[fieldKey] = boolValue
  } else {
    // Remove the filter
    delete filters[fieldKey]
  }
  
  handleFilterChange()
}

const clearTextSearch = () => {
  textSearch.value = ''
  handleTextSearch()
}

const removeFilter = (key: string) => {
  if (key === '$text') {
    clearTextSearch()
  } else {
    delete filters[key]
    // Also remove related keys (e.g., operator, min/max, from/to)
    const relatedKeys = Object.keys(filters).filter(k => k.startsWith(`${key}_`))
    relatedKeys.forEach(k => delete filters[k])
    handleFilterChange()
  }
}

const handleClear = () => {
  textSearch.value = ''
  Object.keys(filters).forEach(key => delete filters[key])
  emitQueryChange()
  emit('clear')
}

const handleRefresh = () => {
  emitQueryChange()
  emit('refresh')
}

// Initialize operators for text fields
onMounted(() => {
  visibleFields.value.forEach(field => {
    if (field.inputType === 'text' || field.inputType === 'email') {
      if (!filters[`${field.key}_operator`]) {
        filters[`${field.key}_operator`] = 'contains'
      }
    }
  })
})

// Watch for changes and emit initial query
watch(() => visibleFields.value, () => {
  emitQueryChange()
}, { immediate: true })
</script>

<style scoped lang="scss">
@use '~/assets/variables' as *;

.search-filter {
  background: var(--background-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1.5rem;
}

.search-filter-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.search-filter-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
}

.search-filter-actions {
  display: flex;
  gap: 0.5rem;
}

.search-filter-text {
  margin-bottom: 1.5rem;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  color: var(--text-secondary);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 0.75rem 2.5rem 0.75rem 2.25rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--background-primary);
  color: var(--text-primary);
  font-size: 0.875rem;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }

  &::placeholder {
    color: var(--text-secondary);
  }
}

.search-clear-btn {
  position: absolute;
  right: 0.5rem;
  padding: 0.25rem;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: 4px;

  &:hover {
    background: var(--background-tertiary);
    color: var(--text-primary);
  }
}

.search-filter-fields {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.search-filter-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.search-filter-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.search-filter-input,
.search-filter-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--background-primary);
  color: var(--text-primary);
  font-size: 0.875rem;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
}

.search-filter-checkbox-group {
  display: flex;
  gap: 1rem;
}

.search-filter-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-primary);
  cursor: pointer;

  input[type="checkbox"] {
    margin: 0;
  }
}

.search-filter-date-range,
.search-filter-number-range {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.search-filter-date-separator,
.search-filter-number-separator {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.search-filter-date,
.search-filter-number {
  flex: 1;
}

.search-filter-text-field {
  display: flex;
  gap: 0.5rem;
}

.search-filter-operator {
  min-width: 100px;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--background-primary);
  color: var(--text-primary);
  font-size: 0.875rem;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
}

.search-filter-text-field .search-filter-input {
  flex: 1;
}

.search-filter-summary {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
}

.search-filter-summary-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.search-filter-summary-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.search-filter-summary-clear {
  padding: 0.25rem 0.5rem;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  color: var(--text-secondary);
  font-size: 0.75rem;
  cursor: pointer;

  &:hover {
    background: var(--background-tertiary);
    color: var(--text-primary);
  }
}

.search-filter-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.search-filter-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.5rem;
  background: var(--primary-color);
  color: white;
  border-radius: 4px;
  font-size: 0.75rem;
}

.search-filter-tag-remove {
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  opacity: 0.8;

  &:hover {
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .search-filter-fields {
    grid-template-columns: 1fr;
  }

  .search-filter-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .search-filter-date-range,
  .search-filter-number-range,
  .search-filter-text-field {
    flex-direction: column;
  }

  .search-filter-operator {
    min-width: auto;
  }
}
</style>
