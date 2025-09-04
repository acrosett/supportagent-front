<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { validateSync, getMetadataStorage } from 'class-validator'
import AppButton from './AppButton.vue'

export interface FieldOverride<T = any> {
  type?: string;
  label?: string;
  placeholder?: string;
  component?: any;
  props?: { disabled?: boolean; [key: string]: any };
  doubleCheck?: boolean;
  isArray?: boolean;
  mapObjectField?: string; // Field to display from objects (e.g. "name") while keeping full objects
  conditionsFields?: (keyof T)[]; // Only show if all these fields are truthy
  invertedConditionsFields?: (keyof T)[]; // Only show if all these fields are falsy
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
  
  // Only set values for visible fields
  visibleFields.forEach(key => {
    if (key in formData) {
      instance[key] = formData[key]
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
        if (!formatted.endsWith('.')) formatted += '.'
        return formatted
      })
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
  visibleFields.forEach(key => { sendData[key] = formData[key] })
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
        <label :for="field.key" class="megaform-label">
          {{ field.label }}
          <span v-if="!field.isOptional" class="megaform-required">*</span>
          <button v-if="field.isArray" type="button" class="megaform-array-add" @click="addArrayItem(field.key)">+</button>
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
        <!-- Custom field override -->
        <component
          v-else-if="fieldOverrides?.[field.key]?.component"
          :is="fieldOverrides?.[field.key]?.component"
          v-model="formData[field.key]"
          :id="field.key"
          :name="field.key"
          v-bind="fieldOverrides?.[field.key]?.props || {}"
          class="megaform-input"
        />
        <!-- Default input with optional placeholder and name -->
        <input
          v-else-if="field.inputType !== 'checkbox'"
          :type="field.inputType"
          v-model="formData[field.key]"
          :id="field.key"
          :name="field.key"
          :placeholder="field.placeholder"
          :disabled="fieldOverrides?.[field.key]?.props?.disabled"
          class="megaform-input"
        />
        <input
          v-else
          type="checkbox"
          v-model="formData[field.key]"
          :id="field.key"
          :name="field.key"
          :disabled="fieldOverrides?.[field.key]?.props?.disabled"
          class="megaform-checkbox"
        />
        <!-- Double check input -->
        <div v-if="fieldOverrides?.[field.key]?.doubleCheck" class="megaform-field megaform-doublecheck" style="margin-top:0.5em;">
          <label :for="field.key + '-double'" class="megaform-label">{{ 'Confirm ' + field.label }}</label>
          <input
            :type="field.inputType"
            v-model="doubleCheckData[field.key]"
            :id="field.key + '-double'"
            :name="field.key + '-double'"
            :placeholder="'Confirm ' + field.label"
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
  margin-left: 0.2em;
  font-size: 1.1em;
  font-weight: bold;
}

.megaform-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1em;
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
.megaform-input {
  padding: 0.6em 1em;
  border: 1px solid $muted;
  border-radius: $radius;
  font-size: 1em;
  background: $panel;
  color: $text;
  box-shadow: $shadow;
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
}
.megaform-input:focus {
  border-color: $brand;
  outline: none;
}
.megaform-checkbox {
  margin-top: 0.5em;
  width: 1.2em;
  height: 1.2em;
  accent-color: $brand-2;
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}
.megaform-error {
  color: $brand-2;
  font-size: 0.95em;
  margin-top: 0.3em;
}


</style>
