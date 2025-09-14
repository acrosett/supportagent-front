<template>
  <div class="page-container debug-page">
    <div class="page-header">
      <h1>Debug Tools</h1>
      <p>Administrative debugging and testing utilities</p>
    </div>

    <div class="debug-sections">
      <!-- LLM Result Parsing Replay Section -->
      <div class="debug-section">
        <div class="section-header">
          <h2>Replay LLM Result Parsing</h2>
          <p>Retrieve and display LLM training data for a specific training log entry</p>
        </div>
        
        <div class="section-content">
          <div class="input-group">
            <label for="trainingLogId">Training Log ID:</label>
            <input
              id="trainingLogId"
              v-model="trainingLogId"
              type="text"
              placeholder="Enter training log ID..."
              class="text-input"
            />
          </div>
          
          <div class="action-buttons">
            <AppButton
              label="Re-run parsing"
              color="primary"
              :disabled="!trainingLogId.trim() || isReplaying"
              :loading="isReplaying"
              @click="replayLLMParsing"
            />
          </div>
          
          <!-- Result Display -->
          <div v-if="replayResult" class="result-section">
            <h3>Training Data Result:</h3>
            <div class="result-content">
              <pre>{{ JSON.stringify(replayResult, null, 2) }}</pre>
            </div>
          </div>
          
          <!-- Error Display -->
          <div v-if="replayError" class="error-section">
            <h3>Error:</h3>
            <div class="error-content">
              <pre>{{ replayError }}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const trainingLogId = ref('')
const isReplaying = ref(false)
const replayResult = ref<any>(null)
const replayError = ref<string | null>(null)

// Check admin access on page load
onMounted(async () => {
  try {
    const role = await useNuxtApp().$userRole;
    if (role !== 'admin') {
      useNuxtApp().$toast.show('Access denied: Admin privileges required', 'error')
      await navigateTo('/')
      return
    }
  } catch (error) {
    console.error('Failed to check admin role:', error)
    useNuxtApp().$toast.show('Failed to verify admin privileges', 'error')
    await navigateTo('/')
  }
})

const replayLLMParsing = async () => {
  if (!trainingLogId.value.trim()) {
    useNuxtApp().$toast.show('Please enter a training log ID', 'error')
    return
  }

  isReplaying.value = true
  replayResult.value = null
  replayError.value = null

  try {
    useNuxtApp().$toast.show('Retrieving training data...', 'info')
    
    // For now, we'll just try to find and display the training data
    // You can replace this with the actual replay endpoint when available
    replayResult.value =  await useNuxtApp().$sp.chatAgent.debug_llm_result_parsing({
      trainingLogId: trainingLogId.value.trim()
    })
  
    
    useNuxtApp().$toast.show('Training data retrieved successfully (simulation)', 'success')
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

.debug-page {

}

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
