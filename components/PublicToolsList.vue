<template>
  <div class="public-tools-list">
    <!-- Search Bar -->
    <div class="search-section">
      <div class="search-bar">
        <AppIcon name="search" size="sm" class="search-icon" />
        <input 
          type="text" 
          :placeholder="t('search.placeholder')"
          v-model="searchQuery"
          class="search-input"
        />
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>{{ t('status.loading') }}</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="publicTools.length === 0" class="empty-state">
      <div class="empty-icon">🛠️</div>
      <h3>{{ t('empty.title') }}</h3>
      <p>{{ t('empty.description') }}</p>
    </div>

    <!-- Tools Grid -->
    <div v-else class="tools-grid">
      <div
        v-for="tool in publicTools"
        :key="tool.id"
        class="tool-card"
      >
        <div class="tool-header">
          <h3 class="tool-name">{{ tool.publicname }}</h3>
          <div class="tool-price">
            ${{ tool.price }} {{ t('tool.perCall') }}
          </div>
        </div>

        <div class="tool-content">
          <p class="tool-description">{{ tool.publicdescription }}</p>
        </div>

        <div class="tool-actions">
          <AppButton
            :label="t('actions.useTool')"
            color="primary"
            size="sm"
            @click="useTool(tool)"
          />
        </div>
      </div>
    </div>

    <!-- Load More Indicator -->
    <div v-if="isLoadingMore" class="loading-more">
      <div class="spinner"></div>
      <p>{{ t('status.loadingMore') }}</p>
    </div>

    <!-- End of Results -->
    <div v-else-if="!hasMoreData && publicTools.length > 0" class="end-of-results">
      <p>{{ t('status.noMoreTools') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import AppButton from '~/components/AppButton.vue'
import AppIcon from '~/components/AppIcon.vue'
import { useLocalNamespaceAsync } from '~/composables/useLocalNamespace'

const { t } = await useLocalNamespaceAsync('public-tools-list')

interface PublicTool {
  id: string
  publicname: string
  publicdescription: string
  price: number
  arguments?: any[]
}

const emit = defineEmits(['use-tool'])

// State
const publicTools = ref<PublicTool[]>([])
const isLoading = ref(true)
const isLoadingMore = ref(false)
const searchQuery = ref('')
const hasMoreData = ref(true)
const currentPage = ref(0)
const pageSize = 20

let searchTimeout: NodeJS.Timeout | null = null

// Load public tools
const loadPublicTools = async (reset = true) => {
  try {
    if (reset) {
      isLoading.value = true
      currentPage.value = 0
      hasMoreData.value = true
    } else {
      isLoadingMore.value = true
    }
    
    const { $sp } = useNuxtApp()
    
    // Build search parameters
    const searchParams: any = {
      text: searchQuery.value || undefined
    }
    
    // Setup pagination options
    const options: any = {
      limit: pageSize,
      offset: reset ? 0 : currentPage.value * pageSize,
      orderBy: {
        publicname: 'asc'
      }
    }
    
    // Search for public tools
    const result = await $sp.customTool.search(searchParams, options)
    
    const newTools = (result.data || []) as PublicTool[]
    
    if (reset) {
      publicTools.value = newTools
    } else {
      publicTools.value = [...publicTools.value, ...newTools]
    }
    
    // Check if there's more data
    hasMoreData.value = newTools.length === pageSize
    
    // Increment page for next load
    if (!reset) {
      currentPage.value++
    }
    
  } catch (error) {
    console.error('Failed to load public tools:', error)
    useNuxtApp().$toast.show(error, 'error')
  } finally {
    isLoading.value = false
    isLoadingMore.value = false
  }
}

const loadMore = () => {
  if (!isLoadingMore.value && hasMoreData.value) {
    currentPage.value++
    loadPublicTools(false)
  }
}

const useTool = (tool: PublicTool) => {
  emit('use-tool', tool)
}

// Setup scroll listener for infinite scroll
const handleScroll = (event: Event) => {
  const target = event.target as HTMLElement
  const scrollTop = target.scrollTop
  const scrollHeight = target.scrollHeight
  const clientHeight = target.clientHeight
  
  // Check if user scrolled near the bottom (within 200px)
  if (scrollTop + clientHeight >= scrollHeight - 200) {
    if (!isLoadingMore.value && hasMoreData.value) {
      loadMore()
    }
  }
}

// Watch search query for real-time search
watch(searchQuery, () => {
  // Debounce the search to avoid too many API calls
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    loadPublicTools(true) // Reset to first page when searching
  }, 500)
})

// Load data on mount
onMounted(() => {
  loadPublicTools(true)
  
  // Add scroll listener to popup content (assuming this will be in a popup)
  // We'll use a more generic approach that works with popup scroll
  setTimeout(() => {
    const popupContent = document.querySelector('.app-popup .popup-content')
    if (popupContent) {
      popupContent.addEventListener('scroll', handleScroll)
    }
  }, 100)
})

onUnmounted(() => {
  if (searchTimeout) clearTimeout(searchTimeout)
  
  // Clean up scroll listener
  const popupContent = document.querySelector('.app-popup .popup-content')
  if (popupContent) {
    popupContent.removeEventListener('scroll', handleScroll)
  }
})
</script>

<style scoped lang="scss">
@use "~/assets/_variables.scss" as *;

.public-tools-list {
  max-width: 800px;
  margin: 0 auto;
}

.search-section {
  margin-bottom: 2rem;
}

.search-bar {
  position: relative;
  
  .search-icon {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: $muted;
  }
  
  .search-input {
    width: 100%;
    padding: 0.75rem 1rem 0.75rem 2.5rem;
    border: 1px solid $muted;
    border-radius: $radius;
    background: $bg;
    color: $text;
    font-size: 0.9rem;
    
    &::placeholder {
      color: $muted;
    }
    
    &:focus {
      outline: none;
      border-color: $brand;
    }
  }
}

.loading-state,
.loading-more {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: $muted;
  
  .spinner {
    width: 32px;
    height: 32px;
    border: 3px solid rgba($brand, 0.2);
    border-top: 3px solid $brand;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
}

.loading-more {
  padding: 1rem;
  
  .spinner {
    width: 24px;
    height: 24px;
    border-width: 2px;
    margin-bottom: 0.5rem;
  }
  
  p {
    font-size: 0.9rem;
  }
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: $muted;
  
  .empty-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }
  
  h3 {
    margin: 0 0 0.5rem 0;
    color: $text;
    font-size: 1.5rem;
  }
  
  p {
    margin: 0;
    line-height: 1.6;
  }
}

.end-of-results {
  text-align: center;
  padding: 2rem;
  color: $muted;
  border-top: 1px solid rgba($muted, 0.2);
  margin-top: 1rem;
  
  p {
    margin: 0;
    font-size: 0.9rem;
  }
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.tool-card {
  background: $bg;
  border: 2px solid $muted;
  border-radius: $radius;
  padding: 1.5rem;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  min-height: 200px;
  
  &:hover {
    border-color: $brand;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
  }
}

.tool-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  gap: 1rem;
  
  .tool-name {
    margin: 0;
    color: $text;
    font-size: 1.1rem;
    font-weight: 600;
    flex: 1;
  }
  
  .tool-price {
    background: rgba($brand, 0.1);
    color: $brand;
    padding: 0.25rem 0.75rem;
    border-radius: $radius;
    font-size: 0.875rem;
    font-weight: 600;
    white-space: nowrap;
  }
}

.tool-content {
  flex-grow: 1;
  margin-bottom: 1.5rem;
  
  .tool-description {
    margin: 0;
    color: $text;
    font-size: 0.9rem;
    line-height: 1.5;
  }
}

.tool-actions {
  margin-top: auto;
}

// Mobile responsive
@media (max-width: 768px) {
  .tools-grid {
    grid-template-columns: 1fr;
  }
  
  .tool-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>