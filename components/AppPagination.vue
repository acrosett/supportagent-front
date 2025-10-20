<template>
  <div v-if="totalPages > 1" class="pagination">
    <AppButton
      :label="t('AppPagination.buttons.previous')"
      :disabled="currentPage === 1"
      color="secondary"
      show-back-icon
      @click="goToPage(currentPage - 1)"
    />

    <div class="pagination-info">
      <span class="page-numbers">
        <button
          v-for="page in visiblePages"
          :key="page"
          :class="['page-btn', { active: page === currentPage, ellipsis: page === '...' }]"
          :disabled="page === '...'"
          @click="typeof page === 'number' && goToPage(page)"
        >
          {{ page }}
        </button>
      </span>
      <span class="total-info">{{ t('AppPagination.info.items', { count: totalItems }) }}</span>
    </div>

    <AppButton
      :label="t('AppPagination.buttons.next')"
      :disabled="currentPage === totalPages"
      color="secondary"
      @click="goToPage(currentPage + 1)"
    />
  </div>
</template>

<script setup lang="ts">
// Composables
const { t } = await useLocalNamespaceAsync('AppPagination')

interface Props {
  currentPage: number
  totalPages: number
  totalItems: number
  maxVisiblePages?: number
}

const props = withDefaults(defineProps<Props>(), {
  maxVisiblePages: 5
})

const emit = defineEmits<{
  'page-change': [page: number]
}>()

const visiblePages = computed(() => {
  const { currentPage, totalPages, maxVisiblePages } = props
  const pages: (number | string)[] = []
  
  if (totalPages <= maxVisiblePages) {
    // Show all pages if total is small
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i)
    }
  } else {
    // Always show first page
    pages.push(1)
    
    // Calculate range around current page
    const start = Math.max(2, currentPage - Math.floor(maxVisiblePages / 2))
    const end = Math.min(totalPages - 1, start + maxVisiblePages - 3)
    
    // Add ellipsis before range if needed
    if (start > 2) {
      pages.push('...')
    }
    
    // Add pages in range
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    
    // Add ellipsis after range if needed
    if (end < totalPages - 1) {
      pages.push('...')
    }
    
    // Always show last page
    if (totalPages > 1) {
      pages.push(totalPages)
    }
  }
  
  return pages
})

const goToPage = (page: number) => {
  if (page >= 1 && page <= props.totalPages && page !== props.currentPage) {
    emit('page-change', page)
  }
}
</script>

<style scoped lang="scss">
@use '~/assets/variables' as *;

.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1.5rem;
  padding: 1rem 0;
  border-top: 1px solid var(--border-color);
}

.pagination-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  justify-content: center;
}

.page-numbers {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.page-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: 1px solid var(--border-color);
  background: var(--background-secondary);
  color: var(--text-secondary);
  border-radius: 4px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: var(--background-tertiary);
    color: var(--text-primary);
  }

  &.active {
    background: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
  }

  &.ellipsis {
    border: none;
    background: transparent;
    cursor: default;
    color: var(--text-secondary);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.total-info {
  font-size: 0.875rem;
  color: var(--text-secondary);
  white-space: nowrap;
}

@media (max-width: 768px) {
  .pagination {
    flex-direction: column;
    gap: 0.75rem;
  }

  .pagination-info {
    order: -1;
  }

  .page-numbers {
    gap: 0.125rem;
  }

  .page-btn {
    width: 1.75rem;
    height: 1.75rem;
    font-size: 0.75rem;
  }
}
</style>
