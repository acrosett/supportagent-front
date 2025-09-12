<script setup lang="ts">
import { ref, reactive, watch, computed, onMounted, onUnmounted } from 'vue'
import { validateSync, getMetadataStorage } from 'class-validator'
import AppButton from './AppButton.vue'
import RichTextEditor from './RichTextEditor.vue'
import ChecklistInput from './ChecklistInput.vue'
import FieldTooltip from './FieldTooltip.vue'
import ToggleSwitch from './ToggleSwitch.vue'

// Component type mapping
const componentTypeMap: Record<string, any> = {
  'richtext': RichTextEditor,
  'checklist': ChecklistInput
}

export interface FieldOverride<T = any> {
  type?: string;
  label?: string;
  placeholder?: string;
  description?: string; // Tooltip description shown on info icon hover
  component?: any;
  props?: { disabled?: boolean; [key: string]: any };
  doubleCheck?: boolean;
  isArray?: boolean;
  mapObjectField?: string; // Field to display from objects (e.g. "name") while keeping full objects
  conditionsFields?: (keyof T)[]; // Only show if all these fields are truthy
  invertedConditionsFields?: (keyof T)[]; // Only show if all these fields are falsy
  maxHeight?: string; // CSS max-height value (e.g. "500px", "20rem")
  maxChars?: number; // Maximum character count for input fields
  selectOptions?: Array<{ label: string; value: any }>; // Options for select dropdown
  onLabel?: string; // Label for toggle switch "ON" state
  offLabel?: string; // Label for toggle switch "OFF" state
  mapValue?: Record<string, any>; // Map form values before validation (e.g. {true: 123, false: undefined})
  titleColor?: string | (() => string | undefined); // Color for the field title/label
}

export type ActionColor = 'primary' | 'secondary' | 'ok' | 'warning' | 'error';
export type ActionMargin = 'left' | 'right' | 'no-margins' | 'both';
export interface MegaFormAction {
  label: string;
  callback: (data: any) => Promise<any>;
  color?: ActionColor;
  margin?: ActionMargin;
  skipValidation?: boolean;
}

export type OverrideRecord<T = any> = Partial<Record<keyof T, FieldOverride<T>>>;

export interface MegaFormProps<T = any> {
  formClass: new () => any;
  modelValue: Record<string, any>;
  instance?: Record<string, any> | null;
  fieldOverrides?: OverrideRecord<T>;
  excludeFields?: (keyof T)[];
  includeFields?: (keyof T)[]; // Only render these fields if provided
  links?: Array<{ label: string; href: string }>;
  actions?: MegaFormAction[];
  hideArrayIndex?: boolean; // Option to show index before array labels
}

const props = defineProps<MegaFormProps>()

const emit = defineEmits(['update:modelValue'])

// Default to true if not provided
const showArrayIndex = !props.hideArrayIndex

const formData = reactive<Record<string, any>>(props.instance ? { ...props.instance } : { ...props.modelValue })
const doubleCheckData = reactive<Record<string, any>>({})
const errors = ref<Record<string, string[]>>({})
const showErrorAnim = ref<Record<number, boolean>>({})
const loading = ref<Record<number, boolean>>({})

// Initialize select fields with empty strings to show placeholder properly
if (props.fieldOverrides) {
  Object.keys(props.fieldOverrides).forEach(fieldKey => {
    const field = props.fieldOverrides![fieldKey]
    if (field && field.selectOptions && (formData[fieldKey] === null || formData[fieldKey] === undefined)) {
      formData[fieldKey] = ''
    }
  })
}

// Infer fields and types from class-validator decorators
function getFields(cls: any) {
  const meta = getMetadataStorage()
  const rawMetas = meta.getTargetValidationMetadatas(cls, '', false, false)
  const fieldMap: Record<string, { types: string[]; isArray: boolean }> = {}
  rawMetas.forEach((m: any) => {
    const name = m.propertyName as string
    if (!fieldMap[name]) fieldMap[name] = { types: [], isArray: false }
    fieldMap[name].types.push(m.name)
    // Detect array by 'each' property in metadata
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
  
  let entries = Object.entries(fieldMap)
  // If includeFields is provided, only render those fields
  if (props.includeFields && props.includeFields.length > 0) {
    entries = entries.filter(([key]) => props.includeFields!.includes(key))
  } else {
    entries = entries.filter(([key]) => !(props.excludeFields ?? []).includes(key))
  }
  // Build a map of which fields are optional

  return entries.map(([key, { types, isArray }]) => {
    let inputType = 'text'
    const override = props.fieldOverrides?.[key]
    const isOptional = types.includes('isOptional');
    isArray = override?.isArray ?? isArray;
    // isInt, isNumber
    if (types.includes('isInt') || types.includes('isNumber')) inputType = 'number'
    if (types.includes('isBoolean')) inputType = 'checkbox'
    if (types.includes('isEmail')) inputType = 'email'
    if (types.includes('isDate')) inputType = 'date'
    if (types.includes('isString')) inputType = 'text'
    if (override?.type) inputType = override.type
    const placeholder = override?.placeholder || ''
    function toLabel(str: string) {
      return str.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim()
    }
    const label = override?.label || toLabel(key)
    return { key, inputType, placeholder, label, isArray, isOptional }
  }).map(field => {
    // Calculate show state based on conditions from other fields
    let show = true
    
    // Check if any other field controls this field's visibility
    Object.entries(props.fieldOverrides || {}).forEach(([controllerKey, controllerOverride]) => {
      if (controllerOverride?.conditionsFields?.includes(field.key)) {
        // This field is controlled by controllerKey - show only if controller is truthy
        if (!formData[controllerKey]) show = false
      }
      if (controllerOverride?.invertedConditionsFields?.includes(field.key)) {
        // This field is inversely controlled by controllerKey - show only if controller is falsy
        if (formData[controllerKey]) show = false
      }
    })
    
    return { ...field, show }
  })
}

const fields = computed(() => getFields(props.formClass))

// Validate and show errors
function validateForm() {
  const instance = new (props.formClass as new () => any)()
  // Only validate fields that are visible
  const visibleFields = fields.value.filter(f => f.show).map(f => f.key)
  
  // Clear the instance completely, then only set visible fields
  Object.keys(instance).forEach(key => {
    delete instance[key]
  })
  
  // Only set values for visible fields with mapValue transformation applied
  visibleFields.forEach(key => {
    if (key in formData) {
      let value = formData[key]
      
      // Apply mapValue transformation if defined BEFORE validation
      const fieldOverride = props.fieldOverrides?.[key]
      if (fieldOverride?.mapValue && value !== undefined && value !== null) {
        const mappedValue = fieldOverride.mapValue[value]
        if (mappedValue !== undefined) {
          value = mappedValue
        }
      }
      
      instance[key] = value
    }
  })

  const result = validateSync(instance, {
    skipMissingProperties: true,
    whitelist: true,
    forbidNonWhitelisted: false
  })
  errors.value = {}
  result.forEach(e => {
    if (e.property && e.constraints) {
      errors.value[e.property] = Object.values(e.constraints).map(msg => {
        let formatted = msg.charAt(0).toUpperCase() + msg.slice(1)
        if (!formatted.endsWith('.') && !formatted.endsWith('!')) formatted += '.'
        return formatted
      })
    }
  })

  // Manual validation for required fields (fields without @IsOptional)
  fields.value.forEach(field => {
    if (field.show && !field.isOptional) {
      const value = formData[field.key]
      const isEmpty = value === null || value === undefined || value === '' || 
                     (typeof value === 'string' && value.trim() === '')
      
      if (isEmpty) {
        if (!errors.value[field.key]) errors.value[field.key] = []
        errors.value[field.key]!.push(`${field.label} is required.`)
      }
    }
  })

  // Double check validation
  if (props.fieldOverrides) {
    Object.entries(props.fieldOverrides).forEach(([key, override]) => {
      if (override?.doubleCheck && visibleFields.includes(key)) {
        if (formData[key] !== doubleCheckData[key]) {
          if (!errors.value[key]) errors.value[key] = []
          errors.value[key].push('Fields do not match.')
        }
      }
    })
  }
}

function handleAction(idx: number, action: MegaFormAction) {

  if (!action.skipValidation) {
    validateForm()
    const hasErrors = Object.keys(errors.value).length > 0
    showErrorAnim.value[idx] = hasErrors
    if (hasErrors) {
      //log the errors
      console.error('Form validation errors:', errors.value)
      setTimeout(() => { showErrorAnim.value[idx] = false }, 600)
      return
    }
  }
  loading.value[idx] = true
  // Only send visible fields in callback
  const visibleFields = fields.value.filter(f => f.show).map(f => f.key)
  const sendData: Record<string, any> = {}
  visibleFields.forEach(key => { 
    let value = formData[key]
    
    // Apply mapValue transformation if defined
    const fieldOverride = props.fieldOverrides?.[key]
    if (fieldOverride?.mapValue && value !== undefined && value !== null) {
      const mappedValue = fieldOverride.mapValue[value]
      if (mappedValue !== undefined) {
        value = mappedValue
      }
    }
    
    sendData[key] = value
  })
  Promise.resolve(action.callback(sendData).catch(err => {
    console.error(err)
    useNuxtApp().$toast.show(err, 'error')
  })).finally(() => {
    loading.value[idx] = false
  })
}

// Function to update object field while preserving the full object structure
function updateObjectField(fieldKey: string, index: number, objectField: string, newValue: string) {
  if (!formData[fieldKey]) formData[fieldKey] = []
  if (!formData[fieldKey][index]) formData[fieldKey][index] = {}
  
  // If it's currently a string, convert to object
  if (typeof formData[fieldKey][index] === 'string') {
    formData[fieldKey][index] = { [objectField]: formData[fieldKey][index] }
  }
  
  // Update the specific field
  formData[fieldKey][index][objectField] = newValue
}

// Helper function to safely get array item value (handles both objects and primitives)
function getArrayItemValue(item: any, fieldKey: string): string {
  const mapField = props.fieldOverrides?.[fieldKey]?.mapObjectField
  if (mapField) {
    // For mapped objects, return the specific field value or empty string
    if (typeof item === 'object' && item !== null) {
      return item[mapField] || ''
    }
    // If it's not an object but we expect it to be, return empty string
    return ''
  }
  // For regular arrays, return the item as string or empty string
  return item || ''
}

// Function to get label styling based on titleColor override
function getLabelStyle(field: any) {
  const override = props.fieldOverrides?.[field.key];
  if (!override?.titleColor) return {};
  
  const color = typeof override.titleColor === 'function' 
    ? override.titleColor() 
    : override.titleColor;
    
  return color ? { color } : {};
}

// Helper function to handle array item input (handles both objects and primitives)
function handleArrayItemInput(fieldKey: string, index: number, event: Event) {
  const target = event.target as HTMLInputElement
  if (!target) return
  
  const mapField = props.fieldOverrides?.[fieldKey]?.mapObjectField
  if (mapField) {
    updateObjectField(fieldKey, index, mapField, target.value)
  } else {
    // Regular array item update
    if (!formData[fieldKey]) formData[fieldKey] = []
    formData[fieldKey][index] = target.value
  }
}

// Function to add new array item - creates object if mapObjectField is specified
function addArrayItem(fieldKey: string) {
  if (!formData[fieldKey]) formData[fieldKey] = []
  
  const override = props.fieldOverrides?.[fieldKey]
  if (override?.mapObjectField) {
    // Create object with empty mapped field and temporary ID
    const tempId = `new_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    formData[fieldKey] = [...formData[fieldKey], { 
      id: tempId,
      [override.mapObjectField]: '' 
    }]
  } else {
    // Create simple string
    formData[fieldKey] = [...formData[fieldKey], '']
  }
}

watch(formData, () => {
  emit('update:modelValue', { ...formData })
})

</script>

<template>
  <form @submit.prevent="validateForm">
    <div v-for="field in fields" :key="field.key" class="megaform-field">
      <template v-if="field.show">
                <label 
          v-if="field.label" 
          :for="field.key"
          class="megaform-label"
          :style="getLabelStyle(field)"
        >
          <div class="megaform-label-content">
            <div class="megaform-label-text">
              <span 
                v-if="!field.isOptional"
                class="megaform-required"
                title="Required"
              >*</span>
              {{ field.label }}
              <FieldTooltip
                v-if="fieldOverrides?.[field.key]?.description"
                :text="fieldOverrides?.[field.key]?.description || ''"
                class="megaform-info-icon"
              >
                <i class="fas fa-info-circle" style="opacity: 0.4;"></i>
              </FieldTooltip>
            </div>
            <div 
              v-if="fieldOverrides?.[field.key]?.maxChars"
              class="megaform-char-counter"
              :class="{ 'megaform-char-counter--exceeded': (formData[field.key] || '').length > (fieldOverrides?.[field.key]?.maxChars || 0) }"
            >
              {{ (formData[field.key] || '').length }}/{{ fieldOverrides?.[field.key]?.maxChars }}
            </div>
          </div>
        </label>
        <!-- Array input rendering -->
        <template v-if="field.isArray">
          <div v-for="(item, idx) in formData[field.key] || []" :key="idx" class="megaform-array-item">
            <span v-if="showArrayIndex" class="megaform-array-index">{{ idx }}.</span>
            <!-- Object field mapping - show mapped field but store full object -->
            <input
              :type="field.inputType"
              :value="getArrayItemValue(item, field.key)"
              @input="handleArrayItemInput(field.key, idx, $event)"
              :id="field.key + '-' + idx"
              :name="field.key + '-' + idx"
              :placeholder="field.placeholder"
              class="megaform-input"
            />
            <button type="button" class="megaform-array-remove" @click="formData[field.key].splice(idx, 1)">×</button>
          </div>
        </template>
        <!-- Custom field override component -->
        <component
          v-else-if="fieldOverrides?.[field.key]?.component"
          :is="fieldOverrides?.[field.key]?.component"
          v-model="formData[field.key]"
          :id="field.key"
          :name="field.key"
          v-bind="fieldOverrides?.[field.key]?.props || {}"
          :class="['megaform-input', fieldOverrides?.[field.key]?.type === 'richtext' ? 'megaform-richtext' : '']"
          :style="fieldOverrides?.[field.key]?.maxHeight ? { 'max-height': fieldOverrides?.[field.key]?.maxHeight } : {}"
        />
        <!-- Auto-mapped component based on type -->
        <component
          v-else-if="componentTypeMap[field.inputType]"
          :is="componentTypeMap[field.inputType]"
          v-model="formData[field.key]"
          :id="field.key"
          :name="field.key"
          v-bind="fieldOverrides?.[field.key]?.props || {}"
          class="megaform-input megaform-richtext"
          :style="fieldOverrides?.[field.key]?.maxHeight ? { 'max-height': fieldOverrides?.[field.key]?.maxHeight } : {}"
        />
        <!-- Select dropdown with options -->
        <select
          v-else-if="fieldOverrides?.[field.key]?.selectOptions"
          v-model="formData[field.key]"
          :id="field.key"
          :name="field.key"
          :disabled="fieldOverrides?.[field.key]?.props?.disabled"
          class="megaform-input megaform-select"
        >
          <option value="" disabled>{{ field.placeholder || 'Select an option...' }}</option>
          <option 
            v-for="option in fieldOverrides?.[field.key]?.selectOptions" 
            :key="option.value" 
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
        <!-- Default input with optional placeholder and name -->
        <input
          v-else-if="field.inputType !== 'checkbox' && field.inputType !== 'color'"
          :type="field.inputType"
          v-model="formData[field.key]"
          :id="field.key"
          :name="field.key"
          :placeholder="field.placeholder"
          :disabled="fieldOverrides?.[field.key]?.props?.disabled"
          :maxlength="fieldOverrides?.[field.key]?.maxChars"
          class="megaform-input"
          :style="fieldOverrides?.[field.key]?.maxHeight ? { 'max-height': fieldOverrides?.[field.key]?.maxHeight } : {}"
        />
        <!-- Color picker -->
        <div v-else-if="field.inputType === 'color'" class="megaform-color-wrapper">
          <input
            type="color"
            v-model="formData[field.key]"
            :id="field.key"
            :name="field.key"
            class="megaform-input megaform-color"
          />
          <input
            type="text"
            v-model="formData[field.key]"
            :id="field.key + '-hex'"
            :name="field.key + '-hex'"
            class="megaform-input megaform-color-hex"
            placeholder="#FFFFFF"
            maxlength="7"
            style="width:110px;"
          />
        </div>
        <ToggleSwitch
          v-else
          v-model="formData[field.key]"
          :disabled="fieldOverrides?.[field.key]?.props?.disabled"
          :on-label="fieldOverrides?.[field.key]?.onLabel || 'ON'"
          :off-label="fieldOverrides?.[field.key]?.offLabel || 'OFF'"
        />
        <!-- Double check input -->
        <div v-if="fieldOverrides?.[field.key]?.doubleCheck" class="megaform-field megaform-doublecheck" style="margin-top:0.5em;">
          <label :for="field.key + '-double'" class="megaform-label">
            <div class="megaform-label-content">
              <div class="megaform-label-text">
                <span 
                  v-if="!field.isOptional"
                  class="megaform-required"
                  title="Required"
                >*</span>
                {{ 'Confirm ' + field.label }}
              </div>
              <div 
                v-if="fieldOverrides?.[field.key]?.maxChars"
                class="megaform-char-counter"
                :class="{ 'megaform-char-counter--exceeded': (doubleCheckData[field.key] || '').length > (fieldOverrides?.[field.key]?.maxChars || 0) }"
              >
                {{ (doubleCheckData[field.key] || '').length }}/{{ fieldOverrides?.[field.key]?.maxChars }}
              </div>
            </div>
          </label>
          <input
            :type="field.inputType"
            v-model="doubleCheckData[field.key]"
            :id="field.key + '-double'"
            :name="field.key + '-double'"
            :placeholder="'Confirm ' + field.label"
            :maxlength="fieldOverrides?.[field.key]?.maxChars"
            class="megaform-input"
          />
        </div>
        <div v-if="errors[field.key]" class="megaform-error">
          <div v-for="err in errors[field.key]" :key="err">{{ err }}</div>
        </div>
      </template>
    </div>
  <div v-if="links?.length" class="megaform-links">
      <a v-for="link in links" :key="link.href" :href="link.href" class="megaform-link">
        {{ link.label }}
      </a>
    </div>
    
    <!-- Slot for additional content above actions -->
    <div v-if="$slots.default" class="megaform-slot">
      <slot />
    </div>
    
    <div class="megaform-actions">
      <template v-for="(action, idx) in actions" :key="action.label">
        <AppButton
          :label="action.label"
          :color="action.color || 'primary'"
          :margin="action.margin || 'right'"
          :loading="loading[idx]"
          :show-error="showErrorAnim[idx]"
          @click="handleAction(idx, action)"
        />
      </template>
    </div>
  </form>
</template>
<style lang="scss" scoped>
@use "~/assets/_variables.scss" as *;


.megaform-array-add {
  margin-left: 0.5em;
  font-size: 1.1em;
  background: $brand-2;
  color: $bg;
  border: none;
  border-radius: 50%;
  width: 1.7em;
  height: 1.7em;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  box-shadow: $shadow;
}
.megaform-array-add:hover {
  background: $brand;
}
.megaform-array-item {
  margin-bottom: 0.5em;
  display: flex;
  align-items: center;
}
.megaform-array-index {
  margin-right: 0.7em;
  font-weight: 500;
  color: $muted;
  min-width: 2em;
  text-align: right;
}

.megaform-array-remove {
  margin-left: 0.5em;
  font-size: 1.1em;
  background: $brand-2;
  color: $bg;
  border: none;
  border-radius: 50%;
  width: 1.4em;
  height: 1.4em;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  box-shadow: $shadow;
  line-height: 1;
}
.megaform-array-remove:hover {
  background: $brand;
}

.megaform-required {
  color: $brand-2;
  margin-right: 0em;
  font-size: 1.1em;
  font-weight: bold;
  cursor: help;
}

.megaform-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1em;
  flex-wrap: wrap;
  
  // Mobile responsive styles
  @media (max-width: 768px) {
    gap: 0.5rem;
    justify-content: center;
    
    // Make buttons smaller on mobile
    :deep(.app-button) {
      padding: 0.5em 1.2em;
      font-size: 0.9em;
      min-width: fit-content;
      flex: 1;
      max-width: 45%;
      
      // Ensure text doesn't wrap
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
  
  @media (max-width: 480px) {
    // Stack buttons vertically on very small screens
    flex-direction: column;
    gap: 0.75rem;
    
    :deep(.app-button) {
      max-width: 100%;
      flex: none;
    }
  }
}
// Remove bottom margin for double check field and its input
.megaform-doublecheck {
  margin-bottom: 0 !important;
}
.megaform-doublecheck .megaform-input {
  margin-bottom: 0 !important;
}
// Remove bottom margin for double check field
.megaform-doublecheck {
  margin-bottom: 0 !important;
}

.megaform-links {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  margin-bottom: 1em;
}
.megaform-link {
  color: $brand-2;
  text-decoration: underline;
  font-size: 1em;
  font-weight: 500;
  cursor: pointer;
}
.megaform-link:hover {
  color: $brand;
}

.megaform-slot {
  margin-bottom: 1.5em;
}

/* Color picker styles */
.megaform-color-wrapper {
  display:flex;
  align-items:center;
  gap:.75rem;
}
.megaform-color {
  padding:0;
  width:60px;
  height:40px;
  border:none;
  background:transparent;
  cursor:pointer;
}
.megaform-color::-webkit-color-swatch-wrapper { padding:0; }
.megaform-color::-webkit-color-swatch { border:1px solid $border; border-radius:8px; }
.megaform-color::-moz-color-swatch { border:1px solid $border; border-radius:8px; }
.megaform-color-hex { flex:0 0 auto; }

// ...existing code...

.megaform-field {
  display: flex;
  flex-direction: column;
  margin-bottom: 1.5em;
}
.megaform-label {
  margin-bottom: 0.5em;
  font-weight: 500;
  color: $text;
}

.megaform-label-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.megaform-label-text {
  display: flex;
  align-items: center;
}

.megaform-char-counter {
  font-size: 0.85em;
  color: $muted;
  font-weight: 400;
  margin-left: auto;
}

.megaform-char-counter--exceeded {
  color: $error;
  font-weight: 500;
}
.megaform-input {
  padding: 0.6em 1em;
  border: 1px solid $muted;
  border-radius: $radius;
  font-size: 1em;
  background: $panel;
  color: $text;
  box-shadow: $shadow;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  
  // Hide number input arrows (spinners) for all browsers
  &[type="number"]::-webkit-inner-spin-button,
  &[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  &[type="number"] {
    -moz-appearance: textfield;
    appearance: textfield;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background: rgba($muted, 0.1);
  }

  &:focus {
    border-color: $brand;
    outline: none;
    box-shadow: 0 0 0 2px rgba($brand, 0.1);
  }
}

// Apply the same base styling to select elements
.megaform-select {
  @extend .megaform-input;
  // Ensure select dropdown has proper cursor
  cursor: pointer;
  // Ensure proper text color inheritance
  color: $text;
  // Add some padding for the dropdown arrow
  padding-right: 2.5em;
  background-image: url("data:image/svg+xml;charset=utf-8,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  
  // Style the dropdown options
  option {
    background: $panel;
    color: $text;
    padding: 0.5em 1em;
    
    &:hover, &:focus {
      background: rgba($brand, 0.1);
      color: $text;
    }
    
    &:disabled {
      color: $muted;
      background: rgba($muted, 0.1);
    }
  }
  
  &:disabled {
    cursor: not-allowed;
    color: $muted;
    background-image: url("data:image/svg+xml;charset=utf-8,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%9ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  }
  
  // Firefox specific dropdown styling
  &::-moz-focusring {
    color: transparent;
    text-shadow: 0 0 0 $text;
  }
}
.megaform-error {
  color: $brand-2;
  font-size: 0.95em;
  margin-top: 0.3em;
}


</style>
