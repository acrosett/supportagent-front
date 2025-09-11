<template>
  <div 
    :class="[
      'example-card',
      `example-card--${viewMode}`,
      { 'example-card--minimized': minimized }
    ]"
    @click="handleSelect"
  >
    <!-- Card Header -->
    <div class="card-header">
      <div class="card-title">
        <h4>{{ item.name || item.title || 'Untitled' }}</h4>
        <span v-if="item.status" :class="['card-status', `card-status--${item.status}`]">
          {{ formatStatus(item.status) }}
        </span>
      </div>
      
      <div class="card-actions">
        <button
          v-for="action in availableActions"
          :key="action.name"
          type="button"
          :class="['card-action-btn', `card-action-btn--${action.type}`]"
          :title="action.label"
          @click.stop="handleAction(action.name)"
        >
          <AppIcon :name="action.icon" size="sm" />
        </button>
      </div>
    </div>

    <!-- Card Content -->
    <div v-if="!minimized" class="card-content">
      <!-- Description -->
      <p v-if="item.description" class="card-description">
        {{ truncateText(item.description, viewMode === 'grid' ? 120 : 200) }}
      </p>

      <!-- Metadata Grid -->
      <div class="card-metadata">
        <div v-if="item.createdAt" class="card-meta-item">
          <AppIcon name="calendar" size="xs" />
          <span>{{ formatDate(item.createdAt) }}</span>
        </div>
        
        <div v-if="item.updatedAt && item.updatedAt !== item.createdAt" class="card-meta-item">
          <AppIcon name="edit" size="xs" />
          <span>{{ formatDate(item.updatedAt) }}</span>
        </div>
        
        <div v-if="item.owner || item.user" class="card-meta-item">
          <AppIcon name="user" size="xs" />
          <span>{{ getOwnerName(item.owner || item.user) }}</span>
        </div>
        
        <div v-if="item.count !== undefined" class="card-meta-item">
          <AppIcon name="stats" size="xs" />
          <span>{{ item.count }} items</span>
        </div>
        
        <div v-if="item.amount !== undefined" class="card-meta-item">
          <AppIcon name="credit-card" size="xs" />
          <span>${{ formatAmount(item.amount) }}</span>
        </div>
      </div>

      <!-- Tags -->
      <div v-if="item.tags && item.tags.length" class="card-tags">
        <span
          v-for="tag in item.tags.slice(0, 3)"
          :key="tag"
          class="card-tag"
        >
          {{ tag }}
        </span>
        <span v-if="item.tags.length > 3" class="card-tag card-tag--more">
          +{{ item.tags.length - 3 }} more
        </span>
      </div>
    </div>

    <!-- Card Footer -->
    <div v-if="showFooter" class="card-footer">
      <div class="card-footer-left">
        <span v-if="item.id" class="card-id">ID: {{ item.id }}</span>
      </div>
      
      <div class="card-footer-right">
        <button
          v-if="allowSelect"
          type="button"
          class="card-select-btn"
          @click.stop="handleSelect"
        >
          Select
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface CardAction {
  name: string
  label: string
  icon: string
  type: 'primary' | 'secondary' | 'danger'
}

export interface ExampleCardProps {
  item: any
  index?: number
  viewMode?: 'grid' | 'list'
  minimized?: boolean
  allowSelect?: boolean
  showFooter?: boolean
  actions?: CardAction[]
}

const props = withDefaults(defineProps<ExampleCardProps>(), {
  viewMode: 'grid',
  minimized: false,
  allowSelect: true,
  showFooter: false,
  actions: () => []
})

const emit = defineEmits<{
  'select': [item: any, index: number]
  'action': [action: string, item: any, index: number]
}>()

const availableActions = computed(() => {
  const defaultActions: CardAction[] = [
    { name: 'edit', label: 'Edit', icon: 'edit', type: 'primary' },
    { name: 'delete', label: 'Delete', icon: 'delete', type: 'danger' }
  ]
  
  return props.actions.length > 0 ? props.actions : defaultActions
})

const handleSelect = () => {
  if (props.allowSelect) {
    emit('select', props.item, props.index || 0)
  }
}

const handleAction = (actionName: string) => {
  emit('action', actionName, props.item, props.index || 0)
}

const formatStatus = (status: string): string => {
  return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ')
}

const formatDate = (date: string | Date): string => {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const formatAmount = (amount: number): string => {
  return amount.toFixed(2)
}

const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

const getOwnerName = (owner: any): string => {
  if (typeof owner === 'string') return owner
  if (typeof owner === 'object' && owner) {
    return owner.name || owner.email || owner.username || 'Unknown'
  }
  return 'Unknown'
}
</script>

<style scoped lang="scss">
@use '~/assets/variables' as *;

.example-card {
  background: var(--background-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--primary-color);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  &--list {
    padding: 1rem 1.5rem;
    border-radius: 6px;

    .card-header {
      margin-bottom: 0.5rem;
    }

    .card-content {
      margin-bottom: 0.5rem;
    }

    .card-metadata {
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 0.5rem;
    }
  }

  &--minimized {
    padding: 1rem;

    .card-header {
      margin-bottom: 0;
    }
  }
}

.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.card-title {
  flex: 1;
  min-width: 0;

  h4 {
    margin: 0 0 0.25rem;
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--text-primary);
    line-height: 1.3;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.card-status {
  display: inline-block;
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;

  &--active,
  &--completed {
    background: var(--success-background);
    color: var(--success-color);
  }

  &--pending,
  &--draft {
    background: var(--warning-background);
    color: var(--warning-color);
  }

  &--inactive,
  &--failed {
    background: var(--error-background);
    color: var(--error-color);
  }

  &--unknown {
    background: var(--background-tertiary);
    color: var(--text-secondary);
  }
}

.card-actions {
  display: flex;
  gap: 0.5rem;
  margin-left: 1rem;
}

.card-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--background-tertiary);
    color: var(--text-primary);
  }

  &--primary:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
  }

  &--danger:hover {
    border-color: var(--error-color);
    color: var(--error-color);
  }
}

.card-content {
  margin-bottom: 1rem;
}

.card-description {
  margin: 0 0 1rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

.card-metadata {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.card-meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-secondary);

  :deep(.icon) {
    color: var(--text-secondary);
    opacity: 0.7;
  }
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.card-tag {
  padding: 0.25rem 0.5rem;
  background: var(--background-tertiary);
  color: var(--text-secondary);
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;

  &--more {
    background: var(--primary-color);
    color: white;
  }
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.card-id {
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-family: monospace;
}

.card-select-btn {
  padding: 0.5rem 1rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: color-mix(in srgb, var(--primary-color) 90%, black);
  }
}

// Responsive adjustments
@media (max-width: 768px) {
  .example-card {
    padding: 1rem;

    &--list {
      padding: 0.75rem 1rem;
    }
  }

  .card-header {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }

  .card-actions {
    margin-left: 0;
  }

  .card-metadata {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .card-title h4 {
    font-size: 1rem;
  }
}
</style>
