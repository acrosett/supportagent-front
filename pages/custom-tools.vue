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
        Provide additional context and instructions that (SMART) client-facing agents should follow when assisting your customers.
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

    <!-- Verified Domains Section -->
    <div class="content-section">
      <div class="section-header">
        <h2>Verified Domains</h2>
        <AppButton
          label="Add Domain"
          color="primary"
          margin="left"
          @click="showAddDomain = true"
        />
      </div>
      
      <p class="section-description">
        Verify domains to enable custom tool integrations with your systems.
      </p>

      <div v-if="verifiedDomains.length === 0" class="empty-state">
        <div class="empty-icon">🌐</div>
        <h3>No domains configured</h3>
        <p>Add a domain to enable custom tool integrations</p>
      </div>

      <div v-else class="domains-grid">
        <div
          v-for="domain in verifiedDomains"
          :key="domain.id"
          class="domain-card"
          :class="{ 'verified': domain.isVerified, 'unverified': !domain.isVerified }"
        >
          <div class="domain-header">
            <div class="domain-info">
              <h4 class="domain-name">{{ domain.domain }}</h4>
              <p v-if="!domain.isVerified && domain.randomString" class="verification-code">
                <strong>Setup Instructions (choose one):</strong><br><br>
                
                <strong>Option 1: DNS TXT Record</strong><br>
                Add a TXT record to your domain's DNS:<br>
                Value: <code>direct-support-ai-verify={{ domain.randomString }}</code><br><br>
                
                <strong>Option 2: Webhook Endpoint</strong><br>
                Create a webhook endpoint at:<br>
                <code>https://{{ domain.domain }}/direct-support-ai-verify-domain</code><br>
                That returns the verification string: <code>{{ domain.randomString }}</code>
              </p>
            </div>
            <div class="domain-status">
              <span
                v-if="domain.isVerified"
                class="status-badge verified"
              >
                <AppIcon name="check" size="sm" />
                Verified
              </span>
              <span v-else class="status-badge unverified">
                <AppIcon name="time" size="sm" />
                Unverified
              </span>
            </div>
          </div>

          <div class="domain-actions">
            <AppButton
              v-if="!domain.isVerified"
              label="Verify Domain"
              color="warning"
              size="sm"
              @click="verifyDomain(domain)"
            />
            <AppButton
              label="Delete"
              color="error"
              :margin="domain.isVerified ? 'no-margins' : 'left'"
              size="sm"
              @click="deleteDomain(domain)"
            />
          </div>
        </div>
      </div>
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
        Create and manage custom tools that (SMART) client-facing agents can use to integrate with your systems.
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
              <strong>Arguments: </strong>
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
      </div>
    </div>

    <!-- Create/Edit Tool Modal -->
        <!-- Create/Edit Tool Popup -->
    <AppPopup
      v-if="showCreateTool"
      :show="showCreateTool"
      title="Custom Tool (our chatbot can create them for you)"
      @close="closeToolForm"
    >
      <CustomToolForm
        :tool="selectedTool"
        @save="handleToolSave"
        @cancel="closeToolForm"
      />
    </AppPopup>

    <!-- Add Domain Popup -->
    <AppPopup
      v-if="showAddDomain"
      :show="showAddDomain"
      title="Add Domain"
      @close="showAddDomain = false"
    >
      <MegaForm
        :formClass="Domain"
        v-model="newDomain"
        :includeFields="['domain']"
        :fieldOverrides="domainOverrides"
        :actions="[{
          label: 'Add Domain',
          callback: handleDomainSave,
          color: 'primary'
        }, {
          label: 'Cancel',
          callback: closeDomainForm,
          color: 'secondary'
        }]"
      />
    </AppPopup>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import MegaForm, { FieldOverride } from '~/components/MegaForm.vue'
import AppButton from '~/components/AppButton.vue'
import AppPopup from '~/components/AppPopup.vue'
import CustomToolForm from '~/components/CustomToolForm.vue'
import { Product } from '~/eicrud_exports/services/SUPPORT-ms/product/product.entity'
import { CustomTool } from '~/eicrud_exports/services/SUPPORT-ms/custom-tool/custom-tool.entity'
import { Domain } from '~/eicrud_exports/services/SUPPORT-ms/domain/domain.entity'

// AI Instructions
let aiInstructions = reactive({
  additionalInstructions: ''
})

const aiInstructionsOverrides: Record<string, FieldOverride> = {
  additionalInstructions: {
    maxChars: 4000,
    type: 'richtext',
    label: 'Additional Instructions',
    description: 'Provide specific instructions for how the AI should behave when using your custom tools. Only SMART AI agents can use custom tools and benefit from extra instructions.',
    placeholder: 'Enter additional instructions for the AI...'
  }
}

// Custom Tools
const customTools = ref<CustomTool[]>([])
const showCreateTool = ref(false)
const selectedTool = ref<CustomTool | null>(null)

// Domain management
const verifiedDomains = ref<Domain[]>([])
const showAddDomain = ref(false)
let newDomain = reactive({
  domain: ''
})

const domainOverrides = {
  domain: {
    label: 'Domain',
    description: 'Enter the domain name you want to verify (e.g., example.com)',
    placeholder: 'example.com',
    required: true
  }
}

// Load data on mount
onMounted(async () => {
  await loadAiInstructions()
  await loadCustomTools()
  await loadDomains()
})

// AI Instructions Methods
async function loadAiInstructions() {
  try {
    const nuxtApp = useNuxtApp()
    if (!nuxtApp.$userProductId) return
    
    const result = await nuxtApp.$sp.product.findOne({
      id: nuxtApp.$userProductId
    })
    
    if (result) {
      aiInstructions.additionalInstructions = result.additionalInstructions || ''
    }
  } catch (error) {
    console.error('Error loading AI instructions:', error)
    useNuxtApp().$toast.show(error, 'error')
  }
}

async function saveAiInstructions(data: any) {
  try {
    const nuxtApp = useNuxtApp()
    if (!nuxtApp.$userProductId) {
      useNuxtApp().$toast.show('Product ID not found', 'error')
      return
    }
    
    await nuxtApp.$sp.product.patch({
      id: nuxtApp.$userProductId
    }, {
      additionalInstructions: data.additionalInstructions
    })
    
    useNuxtApp().$toast.show('AI instructions saved successfully', 'success')
  } catch (error) {
    console.error('Error saving AI instructions:', error)
    useNuxtApp().$toast.show(error, 'error')
    throw error
  }
}

// Custom Tools Methods
async function loadCustomTools() {
  try {
    const nuxtApp = useNuxtApp()
    if (!nuxtApp.$userProductId) return
    
    const result = await nuxtApp.$sp.customTool.find({
      product: nuxtApp.$userProductId
    })
    
    customTools.value = result.data || []
  } catch (error) {
    console.error('Error loading custom tools:', error)
    useNuxtApp().$toast.show(error, 'error')
  }
}

function editTool(tool: CustomTool) {
  selectedTool.value = { ...tool }
  showCreateTool.value = true
}

async function deleteTool(toolId: string) {
  const confirmed = await useNuxtApp().$confirmPopup.show('Are you sure you want to delete this custom tool?')
  if (!confirmed) {
    return
  }

  try {
    const nuxtApp = useNuxtApp()
    await nuxtApp.$sp.customTool.deleteOne({
      id: toolId,
      product: nuxtApp.$userProductId
    })
    
    // Remove from local list
    customTools.value = customTools.value.filter(t => t.id !== toolId)
    useNuxtApp().$toast.show('Custom tool deleted successfully', 'success')
  } catch (error) {
    console.error('Error deleting custom tool:', error)
    useNuxtApp().$toast.show(error, 'error')
  }
}

async function handleToolSave(tool: CustomTool) {
  try {
    // Validate that the tool URL uses a verified domain
    if (tool.url) {
      const toolUrl = new URL(tool.url)
      const toolDomain = toolUrl.hostname
      
      // Exact domain match only - no subdomains
      const verifiedDomain = verifiedDomains.value.find(domain => 
        domain.domain === toolDomain && domain.isVerified
      )
      
      if (!verifiedDomain) {
        useNuxtApp().$toast.show(
          `Domain "${toolDomain}" is not verified. Please add and verify this exact domain before creating the custom tool.`, 
          'error'
        )
        return
      }
    }

    const nuxtApp = useNuxtApp()
    
    if (selectedTool.value?.id) {
      // Update existing tool
      await nuxtApp.$sp.customTool.patch({
        id: selectedTool.value.id,
        product: nuxtApp.$userProductId
      }, tool)
      
      const index = customTools.value.findIndex(t => t.id === tool.id)
      if (index !== -1) {
        customTools.value[index] = { ...tool }
      }
    } else {
      // Create new tool
      const savedTool = await nuxtApp.$sp.customTool.create({
        ...tool,
        product: nuxtApp.$userProductId
      })
      
      customTools.value.push(savedTool)
    }
    
    closeToolForm()
    useNuxtApp().$toast.show('Custom tool saved successfully', 'success')
    loadCustomTools()
  } catch (error) {
    console.error('Error saving custom tool:', error)
    useNuxtApp().$toast.show(error, 'error')
    throw error
  }
}

function closeToolForm() {
  showCreateTool.value = false
  selectedTool.value = null
}

// Domain management methods
async function loadDomains() {
  try {
    const nuxtApp = useNuxtApp()
    if (!nuxtApp.$userProductId) return
    
    const result = await nuxtApp.$sp.domain.find({
      product: nuxtApp.$userProductId
    })
    verifiedDomains.value = result.data || []
  } catch (error) {
    console.error('Failed to load domains:', error)
    useNuxtApp().$toast.show('Failed to load domains', 'error')
  }
}

async function verifyDomain(domain: Domain) {
  try {
    const nuxtApp = useNuxtApp()
    if (!nuxtApp.$userProductId) {
      useNuxtApp().$toast.show('Product ID not found', 'error')
      return
    }

    await nuxtApp.$sp.domain.verify_domainS({
      domainId: domain.id,
      productId: nuxtApp.$userProductId
    })
    
    // Reload domains to get updated verification status
    await loadDomains()
    useNuxtApp().$toast.show('Domain verified successfully!', 'success')
  } catch (error: any) {
    console.error('Failed to verify domain:', error)
    const errorMessage = error?.data?.message || error?.message || 'Domain verification failed'
    
    if (!domain.isVerified && domain.randomString) {
      useNuxtApp().$toast.show(
       error,
        'error'
      )
    } else {
      useNuxtApp().$toast.show(errorMessage, 'error')
    }
  }
}

async function deleteDomain(domain: Domain) {
  try {
    // Check if domain is used by any custom tools (exact domain match only)
    const toolsUsingDomain = customTools.value.filter(tool => {
      if (!tool.url) return false
      
      try {
        const toolUrl = new URL(tool.url)
        return toolUrl.hostname === domain.domain
      } catch {
        return false // Invalid URL
      }
    })
    
    if (toolsUsingDomain.length > 0) {
      useNuxtApp().$toast.show(`Cannot delete domain. It is used by ${toolsUsingDomain.length} custom tool(s).`, 'error')
      return
    }

    const nuxtApp = useNuxtApp()
    await nuxtApp.$sp.domain.deleteOne({ id: domain.id, product: nuxtApp.$userProductId })
    
    verifiedDomains.value = verifiedDomains.value.filter(d => d.id !== domain.id)
    useNuxtApp().$toast.show('Domain deleted successfully!', 'success')
  } catch (error: any) {
    console.error('Failed to delete domain:', error)
    const errorMessage = error?.data?.message || error?.message || 'Failed to delete domain'
    useNuxtApp().$toast.show(errorMessage, 'error')
  }
}

async function handleDomainSave(domainData: any) {
  try {
    const nuxtApp = useNuxtApp()
    if (!nuxtApp.$userProductId) {
      useNuxtApp().$toast.show('Product ID not found', 'error')
      return
    }

    const domain = await nuxtApp.$sp.domain.create({
      ...domainData,
      product: nuxtApp.$userProductId
    })
    
    verifiedDomains.value.push(domain)
    showAddDomain.value = false
    newDomain.domain = ''
    useNuxtApp().$toast.show('Domain created successfully! Please verify it to enable custom tool integrations.', 'success')
  } catch (error: any) {
    console.error('Failed to create domain:', error)
    const errorMessage = error?.data?.message || error?.message || 'Failed to create domain'
    useNuxtApp().$toast.show(errorMessage, 'error')
    throw error
  }
}

async function closeDomainForm() {
  showAddDomain.value = false
  newDomain.domain = ''
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    useNuxtApp().$toast.show('Copied to clipboard!', 'success')
  } catch (error) {
    console.error('Failed to copy text:', error)
    useNuxtApp().$toast.show('Failed to copy to clipboard', 'error')
  }
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

.domains-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1rem;
}

.domain-card {
  background: $bg-white;
  border: 1px solid $border;
  border-radius: 0.5rem;
  padding: 1.25rem;
  transition: all 0.2s ease;

  &:hover {
    border-color: $brand;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);
  }

  &.verified {
    border-color: $ok;
    
    &:hover {
      border-color: $ok;
      box-shadow: 0 2px 8px rgba(124, 247, 195, 0.1);
    }
  }

  &.unverified {
    border-color: $warning;
    
    &:hover {
      border-color: $warning;
      box-shadow: 0 2px 8px rgba(255, 184, 108, 0.1);
    }
  }

  .domain-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;

    .domain-info {
      flex: 1;

      .domain-name {
        margin: 0 0 0.5rem 0;
        color: $text;
        font-size: 1.125rem;
        font-weight: 600;
      }

      .verification-code {
        margin: 0;
        padding: 0.5rem;
        background: $bg;
        border: 1px solid $border;
        border-radius: 0.25rem;
        font-size: 0.875rem;
        color: $text-muted;

        code {
          background: transparent;
          color: $warning;
          font-weight: 600;
        }
      }
    }

    .domain-status {
      .status-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        padding: 0.25rem 0.75rem;
        border-radius: 1rem;
        font-size: 0.875rem;
        font-weight: 500;

        &.verified {
          background: rgba(124, 247, 195, 0.1);
          color: $ok;
        }

        &.unverified {
          background: rgba(255, 184, 108, 0.1);
          color: $warning;
        }
      }
    }
  }

  .domain-actions {
    display: flex;
    gap: 0.5rem;
  }
}
</style>