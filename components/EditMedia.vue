<template>
  <div class="edit-media">
    <div v-if="media" class="edit-form">
      <div class="media-preview">
        <div class="preview-image">
          <img 
            v-if="media.image" 
            :src="media.image" 
            :alt="media.title"
          />
          <div v-else class="placeholder-image">
            <AppIcon name="media" size="lg" />
          </div>
        </div>
        <div class="preview-info">
          <span class="media-type">{{ media.type || 'image' }}</span>
          <span v-if="media.views" class="media-views">{{ media.views }} views</span>
          <div v-if="media.script" class="script-info">
            <span class="script-label">Script:</span>
            <span v-if="loadingScript" class="script-loading">Loading...</span>
            <span v-else class="script-name">{{ scriptName || 'Unknown' }}</span>
          </div>
        </div>
      </div>

      <MegaForm
        :form-class="MediaEntity"
        v-model="editableMedia"
        :instance="editableMedia"
        :include-fields="includeFields"
        :field-overrides="fieldOverrides"
        :actions="formActions"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import MegaForm from './MegaForm.vue'
import ChecklistInput from './ChecklistInput.vue'
import { Media } from '../eicrud_exports/services/OF-ms/media/media.entity'
import type { OverrideRecord, MegaFormAction } from './MegaForm.vue'

export interface MediaItem {
  image?: string

  id?: string

  ofId: string

  title?: string
  description?: string
  price?: number
  views?: number
  createdAt?: Date
  type?: string
  excitementLvl?: number
  clothes?: ClothesOption[] // Array of ClothesOption objects for ChecklistInput
  script?: string // Script ID
  isSoloPPV?: boolean
}

export type ClothesOptions = Record<string, ClothesOption>
export interface ClothesOption {
    id: string
    value: boolean
    label: string
}

interface Props {
  media: MediaItem | null
  isSaving?: boolean
  clothesOptions?: ClothesOptions
  showSoloPPV?: boolean
}

interface Emits {
  (e: 'save', media: MediaItem): void
  (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  clothesOptions: () => ({})
})
const emit = defineEmits<Emits>()

// Reference to Media entity class for MegaForm
const MediaEntity = Media

// Create a local editable copy of the media
const editableMedia = ref<Partial<MediaItem>>({
  id: '',
  description: '',
  excitementLvl: 0,
  clothes: [],
  isSoloPPV: false
})

// Script fetching
const scriptName = ref<string>('')
const loadingScript = ref(false)

// Fetch script name if script ID exists
const fetchScriptName = async (scriptId: string) => {
  if (!scriptId) return
  
  loadingScript.value = true
  try {
    const nuxtApp = useNuxtApp()
    const script = await nuxtApp.$sp.script.findOne({ 
      id: scriptId,
      owner: nuxtApp.$userId,
      model: nuxtApp.$selectedModel.value?.id
    })
    scriptName.value = script?.name || 'Unknown Script'
  } catch (error) {
    console.error('Failed to fetch script:', error)
    scriptName.value = 'Error loading script'
  } finally {
    loadingScript.value = false
  }
}

// Check if this is a new media item
const isNewMedia = computed(() => {
  return !props.media?.id || props.media.id.startsWith('temp_') || props.media.id.startsWith('new_')
})

// Computed include fields based on showSoloPPV prop
const includeFields = computed(() => {
  const baseFields = ['description', 'excitementLvl', 'clothes']
  
  // If showSoloPPV prop is true, include isSoloPPV field
  // if (props.showSoloPPV) {
    baseFields.push('isSoloPPV')
  //}
  
  return baseFields
})

// Field overrides for MegaForm
const fieldOverrides: OverrideRecord<MediaItem> = {

  clothes: {
    component: ChecklistInput,
    label: 'Clothes',
    props: {
      options: props.clothesOptions,
      label: 'Clothes'
    }
  }
}

// Form actions
const formActions: MegaFormAction[] = [
  {
    label: 'Cancel',
    color: 'secondary',
    margin: 'no-margins',
    skipValidation: true,
    callback: async () => {
      emit('cancel')
    }
  },
  {
    label: props.isSaving ? 'Saving...' : (isNewMedia.value ? 'Create Media' : 'Save Changes'),
    color: 'primary', 
    margin: 'no-margins',
    callback: async (data: Partial<MediaItem>) => {
      if (props.media) {
        const updatedMedia: MediaItem = {
          ...props.media,
          ...data
        }
        emit('save', updatedMedia)
      }
    }
  }
]

// Watch for media changes and update editable copy
watch(() => props.media, (newMedia) => {
  if (newMedia) {
    editableMedia.value = {
      description: newMedia.description || '',
      excitementLvl: newMedia.excitementLvl || 0,
      clothes: newMedia.clothes || [],
      isSoloPPV: newMedia.isSoloPPV || false
    }
    
    // Fetch script name if script exists
    if (newMedia.script) {
      fetchScriptName(newMedia.script)
    } else {
      scriptName.value = ''
    }
  }
}, { immediate: true })

// Watch for clothesOptions changes and update selected clothes
watch(() => props.clothesOptions, (newOptions) => {
  if (newOptions && Object.keys(newOptions).length > 0) {
    // Extract clothes that have value: true from the options
    const selectedClothes: ClothesOption[] = Object.values(newOptions).filter(option => option.value)
    
    // Update the editable media with the pre-selected clothes
    editableMedia.value.clothes = selectedClothes
  }
}, { immediate: true, deep: true })
</script>

<style scoped lang="scss">
@use '~/assets/variables' as *;

.edit-media {
  padding: 1rem 0;
}

.media-preview {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background: rgba($muted, 0.05);
  border-radius: 8px;
  
  .preview-image {
    width: 80px;
    height: 80px;
    border-radius: 6px;
    overflow: hidden;
    flex-shrink: 0;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .placeholder-image {
      width: 100%;
      height: 100%;
      background: rgba($muted, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      color: $muted;
      
      svg {
        width: 32px;
        height: 32px;
      }
    }
  }
  
  .preview-info {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 0.25rem;
    
    .media-type {
      font-size: 0.75rem;
      font-weight: 600;
      color: $brand;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .media-views {
      font-size: 0.75rem;
      color: $muted;
    }
    
    .script-info {
      display: flex;
      gap: 0.5rem;
      align-items: center;
      
      .script-label {
        font-size: 0.75rem;
        font-weight: 600;
        color: $text;
      }
      
      .script-name {
        font-size: 0.75rem;
        color: $brand;
        font-weight: 500;
      }
      
      .script-loading {
        font-size: 0.75rem;
        color: $muted;
        font-style: italic;
      }
    }
  }
}

.form-fields {
  .form-group {
    margin-bottom: 1.5rem;
    
    label {
      display: block;
      font-weight: 600;
      color: $text;
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
    }
    
    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid rgba($muted, 0.3);
      border-radius: 6px;
      font-size: 0.875rem;
      font-family: inherit;
      background-color: $bg;
      color: $text;
      
      &:focus {
        outline: none;
        border-color: $brand;
        box-shadow: 0 0 0 3px rgba($brand, 0.1);
      }
      
      &::placeholder {
        color: rgba($muted, 0.7);
      }
    }
    
    textarea.form-control {
      resize: vertical;
      min-height: 100px;
      line-height: 1.5;
    }
    
    select.form-control {
      cursor: pointer;
    }
    
    .field-hint {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      margin-top: 0.5rem;
      font-size: 0.75rem;
      color: rgba($muted, 0.8);
      line-height: 1.4;
      
      svg {
        width: 14px;
        height: 14px;
        flex-shrink: 0;
        margin-top: 1px;
        color: $brand;
      }
    }
  }
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  
  .form-group {
    margin-bottom: 1.5rem;
  }
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba($muted, 0.1);
}

// Mobile responsive
@media (max-width: 768px) {
  .media-preview {
    flex-direction: column;
    align-items: center;
    text-align: center;
    
    .preview-image {
      width: 120px;
      height: 120px;
    }
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 0;
  }
  
  .form-actions {
    flex-direction: column-reverse;
    gap: 0.75rem;
  }
}
</style>
