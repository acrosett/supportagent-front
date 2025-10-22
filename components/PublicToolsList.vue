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
          <h3 class="tool-name">{{ getToolTitle(tool) }}</h3>
          <div class="tool-price">
            ${{ tool.price }} {{ t('tool.perCall') }}
          </div>
        </div>

        <div class="tool-content">
          <p class="tool-description">{{ getToolDescription(tool) }}</p>
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
  name: string
  description: string
  price: number
  arguments?: any[]
  publicName?: string
}

// Map of public tools with i18n keys
const publicToolsMap: Record<string, { title: string; desc: string }> = {
  'meteo-forecast-001': {
    title: 'tools.meteoForecast.title',
    desc: 'tools.meteoForecast.description'
  }
}

const emit = defineEmits(['use-tool'])

// State
const publicTools = ref<PublicTool[]>([])
const isLoading = ref(true)
const searchQuery = ref('')

let searchTimeout: NodeJS.Timeout | null = null

// Load public tools
const loadPublicTools = async () => {
  try {
    isLoading.value = true
    
    const { $sp } = useNuxtApp()
    
    // Build search parameters
    const searchParams: any = {
      text: searchQuery.value || undefined
    }
    
    // Search for public tools (all tools returned, no pagination)
    const result = await $sp.customTool.search(searchParams)
    
    const newTools = (result.data || []) as PublicTool[]
    publicTools.value = newTools
    
  } catch (error) {
    console.error('Failed to load public tools:', error)
    useNuxtApp().$toast.show(error, 'error')
  } finally {
    isLoading.value = false
  }
}

const loadMore = () => {
  // No pagination needed - all tools returned in single call
}

const useTool = (tool: PublicTool) => {
  (tool).publicName = getToolTitle(tool)
  emit('use-tool', tool)
}

// Helper functions to get localized tool info
const getToolTitle = (tool: PublicTool) => {
  const mapping = publicToolsMap[tool.id]
  if (mapping) {
    return t(mapping.title)
  }
  return tool.name
}

const getToolDescription = (tool: PublicTool) => {
  const mapping = publicToolsMap[tool.id]
  if (mapping) {
    return t(mapping.desc)
  }
  return tool.description
}

// Setup scroll listener for infinite scroll (disabled - no pagination)
const handleScroll = (event: Event) => {
  // No pagination needed - all tools returned in single call
}

// Watch search query for real-time search
watch(searchQuery, () => {
  // Debounce the search to avoid too many API calls
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    loadPublicTools() // Reload tools with new search
  }, 500)
})

// Load data on mount
onMounted(() => {
  loadPublicTools()
  
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

.loading-state {
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