<template>
  <div 
    class="image-card"
    :class="{ 'image-card-selected': selected }"
    @click="handleCardClick"
  >
    <!-- Selection checkbox -->
    <div v-if="selectable" class="card-checkbox">
      <input 
        type="checkbox" 
        :checked="selected"
        @input="handleSelectChange"
        @click.stop
      />
    </div>
    
    <div 
      class="card-image"
      :class="{ 'card-image-clickable': image }"
      @click="handleImageClick"
    >
      <img 
        v-if="image" 
        :src="image" 
        :alt="imageAlt || title || t('image.alt')"
        @error="handleImageError"
      />
      <div v-else class="placeholder-image">
        <AppIcon name="media" size="lg" />
      </div>
      
      <!-- Badges -->
      <div v-if="badges && badges.length > 0" class="card-badges">
        <div 
          v-for="badge in badges" 
          :key="badge.label"
          class="badge"
          :style="{ 
            backgroundColor: badge.color || '$brand',
            color: getBadgeTextColor(badge.color || '$brand')
          }"
        >
          {{ badge.label }}
        </div>
      </div>
      
      <!-- Action buttons -->
      <div class="card-actions">
        <button
          v-for="action in actions"
          :key="action.label"
          :class="[
            'action-btn',
            `action-btn-${action.color || 'secondary'}`
          ]"
          :title="action.title || action.label"
          @click.stop="action.handler"
        >
          <AppIcon v-if="action.icon" :name="action.icon" size="sm" />
          <span v-if="!action.icon">{{ action.label }}</span>
        </button>
      </div>
    </div>
    
    <!-- Card content - only show if there's content to display -->
    <div v-if="hasContent" class="card-content">
      <h3 v-if="title" class="card-title">{{ title }}</h3>
      <p v-if="description" class="card-description">{{ description }}</p>
      
      <div v-if="meta && meta.length > 0" class="card-meta">
        <span 
          v-for="item in meta" 
          :key="item.label"
          class="meta-item"
        >
          <AppIcon v-if="item.icon" :name="getMetaIconName(item.icon)" size="xs" />
          {{ item.label }}
        </span>
      </div>
    </div>
    
    <!-- Image Preview Popup -->
    <Teleport to="body">
      <div 
        v-if="showImagePreview" 
        class="image-preview-overlay"
        @click="closeImagePreview"
      >
        <div class="image-preview-container">
          <button 
            class="close-button"
            @click="closeImagePreview"
            :title="t('actions.closePreview')"
          >
            <AppIcon name="close" size="lg" />
          </button>
          <img 
            v-if="image"
            :src="image" 
            :alt="imageAlt || title || t('image.fullSizeAlt')"
            class="preview-image"
            @click.stop
          />
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const { t } = useLocalNamespace('ImageCard')

interface CardAction {
  label: string
  icon?: 'edit' | 'delete' | 'view' | 'download' | 'more'
  color?: 'primary' | 'secondary' | 'error' | 'ok' | 'warning'
  title?: string
  handler: () => void
}

interface MetaItem {
  label: string
  icon?: 'time' | 'views' | 'user' | 'calendar'
}

interface Badge {
  label: string
  color?: string
}

interface Props {
  title?: string
  description?: string
  image?: string
  imageAlt?: string
  badges?: Badge[]
  actions?: CardAction[]
  meta?: MetaItem[]
  clickable?: boolean
  selectable?: boolean
  selected?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  actions: () => [],
  meta: () => [],
  clickable: true,
  selectable: false,
  selected: false
})

const emit = defineEmits<{
  click: []
  select: [selected: boolean]
}>()

const showImagePreview = ref(false)

// Memoized computed properties
const hasContent = computed(() => 
  !!(props.title || props.description || props.meta?.length)
)

// Simplified event handlers
const handleCardClick = () => props.clickable && emit('click')

const handleImageClick = (event: Event) => {
  event.stopPropagation()
  if (props.image) showImagePreview.value = true
}

const closeImagePreview = () => showImagePreview.value = false

const handleSelectChange = (event: Event) => {
  emit('select', (event.target as HTMLInputElement).checked)
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  const placeholder = img.parentElement?.querySelector('.placeholder-image') as HTMLElement
  if (placeholder) {
    img.style.display = 'none'
    placeholder.style.display = 'flex'
  }
}

// Memoized icon mapping
const iconMap = {
  views: 'eye',
  time: 'time',
  user: 'user',
  calendar: 'calendar'
} as const

const getMetaIconName = (iconType: string) => 
  iconMap[iconType as keyof typeof iconMap] || 'info'

// Function to determine text color based on background color
const getBadgeTextColor = (bgColor: string) => {
  // For dark colors, use white text
  if (bgColor.includes('error') || bgColor.includes('ok') || bgColor.includes('#')) {
    return 'white'
  }
  // For light/brand colors, use dark text
  return '#0a0d14'
}
</script>

<style scoped lang="scss">
@use '~/assets/variables' as *;

.image-card {
  background: $panel;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  position: relative;
  display: flex;
  flex-direction: column;
  height: 400px !important;
  min-height: 400px;
  max-height: 400px;
  will-change: transform; // Hint browser for transform optimizations
  
  // Use more performant hover effects
  &:hover {
    border-color: rgba($brand, 0.3);
  }
  
  &:not([data-clickable="true"]) {
    cursor: default;
  }
}

.image-card-selected {
  border-color: $brand;
  box-shadow: 0 0 0 2px rgba($brand, 0.2);
}

.card-checkbox {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  z-index: 10;
  
  input[type="checkbox"] {
    width: 20px;
    height: 20px;
    accent-color: $brand;
    cursor: pointer;
    border-radius: 4px;
    transition: none; // Remove transition for immediate response
    will-change: auto; // Optimize for frequent changes
  }
}

.card-image {
  position: relative;
  flex: 1;
  min-height: 120px;
  background: $panel; // Use solid color instead of gradient
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  
  &.card-image-clickable {
    cursor: pointer;
  }
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
  }
  
  .placeholder-image {
    display: none;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    color: rgba($muted, 0.5);
  }
}

.card-badges {
  position: absolute;
  bottom: 0.75rem;
  right: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  align-items: flex-end;
}

.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  white-space: nowrap;
}

.card-actions {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  display: flex;
  gap: 0.5rem;
  opacity: 0;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  padding: 0.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  will-change: transform; // Hint for transform optimizations
  
  // Remove expensive hover effects
  &:hover {
    opacity: 0.9;
  }
  
  &:active {
    transform: scale(0.95);
  }
}

.action-btn-primary {
  background: rgba($brand, 0.9);
  color: #0a0d14;
  
  &:hover {
    background: $brand;
  }
}

.action-btn-secondary {
  background: rgba($panel, 0.9);
  color: $muted;
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  &:hover {
    background: rgba($panel, 1);
    color: $text;
    border-color: rgba(255, 255, 255, 0.2);
  }
}

.action-btn-error {
  background: rgba($error, 0.9);
  color: white;
  
  &:hover {
    background: $error;
  }
}

.action-btn-ok {
  background: rgba($ok, 0.9);
  color: white;
  
  &:hover {
    background: $ok;
  }
}

.action-btn-warning {
  background: rgba($warning, 0.9);
  color: #0a0d14;
  
  &:hover {
    background: $warning;
  }
}

.image-card:hover .card-actions {
  opacity: 1;
}

.card-content {
  padding: 1rem;
  flex-shrink: 0;
  overflow: hidden; // Prevent content from expanding the card
}

.card-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: $text;
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap; // Keep title on one line
}

.card-description {
  color: $muted;
  font-size: 0.875rem;
  margin: 0 0 1rem 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3; // Limit to 3 lines max
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word; // Prevent long words from breaking layout
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.8rem;
  color: rgba($muted, 0.8);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  
  svg {
    width: 14px;
    height: 14px;
    stroke-width: 2;
  }
}

// Mobile responsive
@media (max-width: 768px) {
  .card-actions {
    opacity: 1;
    top: 0.5rem;
    right: 0.5rem;
  }
  
  .card-badges {
    bottom: 0.5rem;
    right: 0.5rem;
  }
  
  .close-button {
    top: -2.5rem;
    width: 36px;
    height: 36px;
  }
}

// Image Preview Popup
.image-preview-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 2rem;
  cursor: pointer;
  

  @media (max-width: 768px) {
    padding: 1rem;
  }
}

.image-preview-container {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-image {
  max-width: 90vw;
  max-height: 90vh;
  object-fit: contain;
  border-radius: 8px;
  cursor: default;
}

.close-button {
  position: absolute;
  top: -3rem;
  right: 0;
  background: rgba(255, 255, 255, 0.2); // Remove backdrop-filter
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
}
</style>
