<template>
  <div class="page-container debug-page">
    <div class="page-header">
      <h1>{{ t('page.title') }}</h1>
      <p>{{ t('page.subtitle') }}</p>
    </div>

    <div class="debug-sections">
      <!-- LLM Result Parsing Replay Section -->
      <div class="debug-section">
        <div class="section-header">
          <h2>{{ t('llmReplay.title') }}</h2>
          <p>{{ t('llmReplay.description') }}</p>
        </div>
        
        <div class="section-content">
          <div class="input-group">
            <label for="trainingLogId">{{ t('llmReplay.form.trainingLogId.label') }}</label>
            <input
              id="trainingLogId"
              v-model="trainingLogId"
              type="text"
              :placeholder="t('llmReplay.form.trainingLogId.placeholder')"
              class="text-input"
            />
          </div>
          
          <div class="action-buttons">
            <AppButton
              :label="t('llmReplay.form.button')"
              color="primary"
              :disabled="!trainingLogId.trim() || isReplaying"
              :loading="isReplaying"
              @click="replayLLMParsing"
            />
          </div>
          
          <!-- Result Display -->
          <div v-if="replayResult" class="result-section">
            <h3>{{ t('llmReplay.results.title') }}</h3>
            <div class="result-content">
              <pre>{{ JSON.stringify(replayResult, null, 2) }}</pre>
            </div>
          </div>
          
          <!-- Error Display -->
          <div v-if="replayError" class="error-section">
            <h3>{{ t('llmReplay.results.error') }}</h3>
            <div class="error-content">
              <pre>{{ replayError }}</pre>
            </div>
          </div>
        </div>
      </div>

      <!-- Delete Client Data Section -->
      <div class="debug-section">
        <div class="section-header">
          <h2>{{ t('deleteClientData.title') }}</h2>
          <p class="warning-text">{{ t('deleteClientData.warning') }}</p>
        </div>
        
        <div class="section-content">
          <div class="action-buttons">
            <AppButton
              :label="t('deleteClientData.button')"
              color="error"
              :loading="isDeletingClientData"
              @click="deleteClientData"
            />
          </div>
        </div>
      </div>

      <!-- Effective Delete Account Section -->
      <div class="debug-section">
        <div class="section-header">
          <h2>{{ t('effectiveDelete.title') }}</h2>
          <p class="warning-text">{{ t('effectiveDelete.warning') }}</p>
        </div>
        
        <div class="section-content">
          <MegaForm
            :formClass="EffectiveDeleteAccountDto"
            v-model="deleteAccountFormData"
            :fieldOverrides="deleteAccountFieldOverrides"
            :actions="deleteAccountActions"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppButton from '~/components/AppButton.vue'
import MegaForm from '~/components/MegaForm.vue'
import type { MegaFormAction, OverrideRecord } from '~/components/MegaForm.vue'
import { EffectiveDeleteAccountDto } from '~/eicrud_exports/services/AUTH-ms/account-deletion/cmds/effective_delete_account/effective_delete_account.dto'

// Composables
const { t } = await useLocalNamespaceAsync('debug')

// Meta
useHead({
  title: () => t('meta.title')
})

const trainingLogId = ref('')
const isReplaying = ref(false)
const replayResult = ref<any>(null)
const replayError = ref<string | null>(null)

// Delete client data state
const isDeletingClientData = ref(false)

// Effective Delete Account form data
const deleteAccountFormData = ref<EffectiveDeleteAccountDto>({
  productId: '',
  reason: ''
})

// Form configuration
const deleteAccountFieldOverrides: OverrideRecord<EffectiveDeleteAccountDto> = {
  productId: {
    label: t('effectiveDelete.form.productId.label'),
    placeholder: t('effectiveDelete.form.productId.placeholder'),
    description: t('effectiveDelete.form.productId.description')
  },
  reason: {
    label: t('effectiveDelete.form.reason.label'),
    type: 'textarea',
    placeholder: t('effectiveDelete.form.reason.placeholder'),
    description: t('effectiveDelete.form.reason.description')
  }
}

// Form actions
const deleteAccountActions: MegaFormAction[] = [
  {
    label: t('effectiveDelete.button'),
    color: 'error',
    callback: async (data: EffectiveDeleteAccountDto) => {
      try {
        const nuxtApp = useNuxtApp()
        
        const confirmed = await nuxtApp.$confirmPopup.show(
          t('effectiveDelete.confirmation', { 
            productId: data.productId, 
            reason: data.reason 
          })
        )
        
        if (!confirmed) return
        
        nuxtApp.$toast.show(t('effectiveDelete.messages.executing'), 'info')
        
        const result = await nuxtApp.$sp.accountDeletion.effective_delete_account(data)
        
        nuxtApp.$toast.show(t('effectiveDelete.messages.success'), 'success')
        
        // Reset form
        deleteAccountFormData.value = {
          productId: '',
          reason: ''
        }
        
        console.log('Deletion result:', result)
        
      } catch (error) {
        console.error('Failed to delete account:', error)
        useNuxtApp().$toast.show(t('messages.error.deleteAccount'), 'error')
        throw error
      }
    }
  }
]

// Check admin access on page load
onMounted(async () => {
  try {
    const role = await useNuxtApp().$userRole;
    if (role !== 'admin') {
      useNuxtApp().$toast.show(t('messages.error.accessDenied'), 'error')
      await navigateTo('/')
      return
    }
  } catch (error) {
    console.error('Failed to check admin role:', error)
    useNuxtApp().$toast.show(t('messages.error.verifyAdmin'), 'error')
    await navigateTo('/')
  }
})

const deleteClientData = async () => {
  try {
    const nuxtApp = useNuxtApp()
    
    const confirmed = await nuxtApp.$confirmPopup.show(
      t('deleteClientData.confirmation')
    )
    
    if (!confirmed) return
    
    isDeletingClientData.value = true
    nuxtApp.$toast.show(t('deleteClientData.messages.deleting'), 'info')
    
    await nuxtApp.$sp.message.admin_delete_client({
      clientUniqueId: nuxtApp.$userId,
      productId: nuxtApp.$userProductId
    })
    
    nuxtApp.$toast.show(t('deleteClientData.messages.success'), 'success')
    
  } catch (error) {
    console.error('Failed to delete client data:', error)
    useNuxtApp().$toast.show(error, 'error')
  } finally {
    isDeletingClientData.value = false
  }
}

const replayLLMParsing = async () => {
  if (!trainingLogId.value.trim()) {
    useNuxtApp().$toast.show(t('llmReplay.messages.idRequired'), 'error')
    return
  }

  isReplaying.value = true
  replayResult.value = null
  replayError.value = null

  try {
    useNuxtApp().$toast.show(t('llmReplay.messages.retrieving'), 'info')
    
    // For now, we'll just try to find and display the training data
    // You can replace this with the actual replay endpoint when available
    replayResult.value =  await useNuxtApp().$sp.debug.debug_llm_result_parsing({
      trainingLogId: trainingLogId.value.trim()
    })
  
    
    useNuxtApp().$toast.show(t('llmReplay.messages.success'), 'success')
  } catch (error: any) {
    console.error('Failed to replay LLM parsing:', error)
    replayError.value = error?.response?.data?.message || error?.message || 'Unknown error occurred'
    useNuxtApp().$toast.show(error, 'error')
  } finally {
    isReplaying.value = false
  }
}
</script>

<style scoped lang="scss">
@use '~/assets/variables' as *;

// Uses global .page-container for sizing

.page-header {
  margin-bottom: 3rem;
  
  h1 {
    margin: 0 0 0.5rem 0;
    font-size: 2rem;
    font-weight: 600;
    color: $text;
  }
  
  p {
    margin: 0;
    color: $muted;
    font-size: 1.1rem;
  }
}

.debug-sections {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.debug-section {
  background: $panel;
  border: 1px solid rgba($ring, 0.1);
  border-radius: 12px;
  padding: 2rem;
  
  .section-header {
    margin-bottom: 2rem;
    
    h2 {
      margin: 0 0 0.5rem 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: $text;
    }
    
    p {
      margin: 0;
      color: $muted;
    }
    
    .warning-text {
      color: $error;
      font-weight: 600;
      background: rgba($error, 0.1);
      padding: 0.75rem;
      border-radius: 6px;
      border: 1px solid rgba($error, 0.2);
    }
  }
  
  .section-content {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  
  label {
    font-weight: 600;
    color: $text;
    font-size: 0.875rem;
  }
  
  .text-input {
    padding: 0.75rem 1rem;
    border: 1px solid rgba($ring, 0.2);
    border-radius: 8px;
    background: $bg;
    color: $text;
    font-size: 1rem;
    transition: border-color 0.2s ease;
    
    &:focus {
      outline: none;
      border-color: $brand;
    }
    
    &::placeholder {
      color: $muted;
    }
  }
}

.action-buttons {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.result-section,
.error-section {
  margin-top: 1rem;
  
  h3 {
    margin: 0 0 1rem 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: $text;
  }
  
  .result-content,
  .error-content {
    background: $bg;
    border: 1px solid rgba($ring, 0.2);
    border-radius: 8px;
    padding: 1rem;
    max-height: 400px;
    overflow-y: auto;
    
    pre {
      margin: 0;
      font-family: 'Courier New', monospace;
      font-size: 0.875rem;
      line-height: 1.4;
      white-space: pre-wrap;
      word-break: break-word;
    }
  }
}

.error-section {
  .error-content {
    border-color: rgba($warning, 0.3);
    background: rgba($warning, 0.05);
    
    pre {
      color: $warning;
    }
  }
}

// Mobile responsive
@media (max-width: 768px) {
  .debug-page {
    padding: 1rem;
  }
  
  .page-header {
    margin-bottom: 2rem;
    
    h1 {
      font-size: 1.75rem;
    }
    
    p {
      font-size: 1rem;
    }
  }
  
  .debug-section {
    padding: 1.5rem;
    
    .section-header {
      margin-bottom: 1.5rem;
      
      h2 {
        font-size: 1.25rem;
      }
    }
  }
  
  .action-buttons {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
