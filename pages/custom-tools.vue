<template>
  <section class="page-container custom-tools-page">
    <header class="page-header">
      <div class="page-title">
        <h1>Custom Tools</h1>
      </div>
    </header>
    
    <!-- AI Instructions Section -->
    <div class="content-section">
      <div class="section-header">
        <h2>Additional Instructions for AI</h2>
      </div>
      <p class="section-description">
        Provide additional context and instructions that the AI should follow when supporting your customers.
      </p>
      
      <MegaForm
        :formClass="Product"
        v-model="aiInstructions"
        :fieldOverrides="aiInstructionsOverrides"
        :includeFields="['additionalInstructions']"
        :actions="[{
          label: 'Save Instructions',
          callback: saveAiInstructions,
          color: 'primary'
        }]"
      />
    </div>

    <!-- Custom Tools Section -->
    <div class="content-section">
      <div class="section-header">
        <h2>Custom Tools</h2>
        <AppButton
          label="Add Custom Tool"
          color="primary"
          margin="left"
          @click="showCreateTool = true"
        />
      </div>
      
      <p class="section-description">
        Create and manage custom tools that the AI can use to integrate with your systems.
      </p>

      <!-- Custom Tools List -->
      <div v-if="customTools.length > 0" class="tools-list">
        <div 
          v-for="tool in customTools" 
          :key="tool.id" 
          class="tool-card"
        >
          <div class="tool-header">
            <h3 class="tool-name">{{ tool.name }}</h3>
            <div class="tool-actions">
              <AppButton
                label="Edit"
                color="secondary"
                margin="no-margins"
                @click="editTool(tool)"
              />
              <AppButton
                label="Delete"
                color="error"
                margin="no-margins"
                @click="deleteTool(tool.id)"
              />
            </div>
          </div>
          
          <div class="tool-details">
            <p v-if="tool.description" class="tool-description">{{ tool.description }}</p>
            <div class="tool-meta">
              <span class="tool-method">{{ tool.method }}</span>
              <span class="tool-url">{{ tool.url }}</span>
              <span class="tool-enabled" :class="{ disabled: !tool.enabled }">
                {{ tool.enabled ? 'Enabled' : 'Disabled' }}
              </span>
            </div>
            <div v-if="tool.arguments && tool.arguments.length > 0" class="tool-arguments">
              <strong>Arguments:</strong>
              <span class="argument-count">{{ tool.arguments.length }} parameter(s)</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <div class="empty-icon">🛠️</div>
        <h3>No Custom Tools Yet</h3>
        <p>Create your first custom tool to start integrating with external systems.</p>
        <AppButton
          label="Create First Tool"
          color="primary"
          @click="showCreateTool = true"
        />
      </div>
    </div>

    <!-- Create/Edit Tool Modal -->
    <AppPopup :show="showCreateTool" title="Custom Tool" size="lg" @close="closeToolForm">
      <CustomToolForm
        :tool="selectedTool"
        @save="handleToolSave"
        @cancel="closeToolForm"
      />
    </AppPopup>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import MegaForm from '~/components/MegaForm.vue'
import AppButton from '~/components/AppButton.vue'
import AppPopup from '~/components/AppPopup.vue'
import CustomToolForm from '~/components/CustomToolForm.vue'
import { Product } from '~/eicrud_exports/services/SUPPORT-ms/product/product.entity'
import { CustomTool } from '~/eicrud_exports/services/SUPPORT-ms/custom-tool/custom-tool.entity'

// AI Instructions
const aiInstructions = reactive({
  additionalInstructions: ''
})

const aiInstructionsOverrides = {
  additionalInstructions: {
    type: 'richtext',
    label: 'Additional Instructions',
    description: 'Provide specific instructions for how the AI should behave when using your custom tools',
    placeholder: 'Enter additional instructions for the AI...'
  }
}

// Custom Tools
const customTools = ref<CustomTool[]>([])
const showCreateTool = ref(false)
const selectedTool = ref<CustomTool | null>(null)

// Load data on mount
onMounted(async () => {
  await loadAiInstructions()
  await loadCustomTools()
})

// AI Instructions Methods
async function loadAiInstructions() {
  try {
    // TODO: Load current product's additional instructions
    // This would typically come from your API
    console.log('Loading AI instructions...')
  } catch (error) {
    console.error('Error loading AI instructions:', error)
    useNuxtApp().$toast.show('Failed to load AI instructions', 'error')
  }
}

async function saveAiInstructions(data: any) {
  try {
    console.log('Saving AI instructions:', data)
    // TODO: Save to your API
    useNuxtApp().$toast.show('AI instructions saved successfully', 'success')
  } catch (error) {
    console.error('Error saving AI instructions:', error)
    useNuxtApp().$toast.show('Failed to save AI instructions', 'error')
    throw error
  }
}

// Custom Tools Methods
async function loadCustomTools() {
  try {
    // TODO: Load custom tools from your API
    console.log('Loading custom tools...')
    // Mock data for now
    customTools.value = []
  } catch (error) {
    console.error('Error loading custom tools:', error)
    useNuxtApp().$toast.show('Failed to load custom tools', 'error')
  }
}

function editTool(tool: CustomTool) {
  selectedTool.value = { ...tool }
  showCreateTool.value = true
}

async function deleteTool(toolId: string) {
  if (!confirm('Are you sure you want to delete this custom tool?')) {
    return
  }

  try {
    console.log('Deleting tool:', toolId)
    // TODO: Delete from your API
    
    // Remove from local list
    customTools.value = customTools.value.filter(t => t.id !== toolId)
    useNuxtApp().$toast.show('Custom tool deleted successfully', 'success')
  } catch (error) {
    console.error('Error deleting custom tool:', error)
    useNuxtApp().$toast.show('Failed to delete custom tool', 'error')
  }
}

async function handleToolSave(tool: CustomTool) {
  try {
    console.log('Saving tool:', tool)
    // TODO: Save to your API
    
    if (tool.id) {
      // Update existing tool
      const index = customTools.value.findIndex(t => t.id === tool.id)
      if (index !== -1) {
        customTools.value[index] = { ...tool }
      }
    } else {
      // Add new tool
      const newTool = { ...tool, id: Date.now().toString() } // Mock ID
      customTools.value.push(newTool)
    }
    
    closeToolForm()
    useNuxtApp().$toast.show('Custom tool saved successfully', 'success')
  } catch (error) {
    console.error('Error saving custom tool:', error)
    useNuxtApp().$toast.show('Failed to save custom tool', 'error')
    throw error
  }
}

function closeToolForm() {
  showCreateTool.value = false
  selectedTool.value = null
}
</script>

<style lang="scss" scoped>
@use "~/assets/_variables.scss" as *;

.page-header {
  margin-bottom: 2rem;
}

.page-title {
  h1 {
    margin: 0;
    color: $text;
    font-size: 2rem;
  }
}

.content-section {
  background: $panel;
  border-radius: $radius;
  box-shadow: $shadow;
  padding: 2rem;
  margin-bottom: 2rem;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;

  h2 {
    margin: 0;
    color: $text;
    font-size: 1.5rem;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}

.section-description {
  color: $muted;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.tools-list {
  display: grid;
  gap: 1rem;
}

.tool-card {
  background: $bg;
  border: 1px solid $border;
  border-radius: $radius;
  padding: 1.5rem;
  transition: box-shadow 0.2s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

.tool-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}

.tool-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: $text;
  margin: 0;
  text-transform: capitalize;
}

.tool-actions {
  display: flex;
  gap: 0.5rem;
}

.tool-details {
  .tool-description {
    color: $text;
    margin-bottom: 1rem;
    line-height: 1.6;
  }

  .tool-meta {
    display: flex;
    gap: 1rem;
    margin-bottom: 0.5rem;
    flex-wrap: wrap;

    > span {
      font-size: 0.875rem;
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      font-weight: 500;
    }
  }

  .tool-method {
    background: rgba($brand, 0.1);
    color: $brand;
    text-transform: uppercase;
  }

  .tool-url {
    background: rgba($muted, 0.1);
    color: $muted;
    font-family: monospace;
  }

  .tool-enabled {
    background: rgba($ok, 0.1);
    color: $ok;

    &.disabled {
      background: rgba($error, 0.1);
      color: $error;
    }
  }

  .tool-arguments {
    font-size: 0.875rem;
    color: $muted;

    .argument-count {
      font-weight: 500;
      color: $text;
    }
  }
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;

  .empty-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  h3 {
    font-size: 1.5rem;
    font-weight: 600;
    color: $text;
    margin-bottom: 1rem;
  }

  p {
    color: $muted;
    margin-bottom: 2rem;
    line-height: 1.6;
  }
}
</style>