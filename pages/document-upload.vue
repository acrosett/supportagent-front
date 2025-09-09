<template>
  <div class="page-container document-upload-page">
    <div class="upload-header">
      <div class="header-content">
        <AppButton
          label="Back to FAQ"
          color="secondary"
          :showBackIcon="true"
          @click="navigateToFAQ"
        />
        <h1>
          Document Upload & Processing
        </h1>
        <div></div> <!-- Spacer for flexbox alignment -->
      </div>
    </div>

    <div class="upload-content">
      <div class="upload-section">
        <p class="ai-note">
          The AI will use this file to update the FAQ.
        </p>
        <DigestFile v-model="processedText" @error="handleError" />
        
        <div v-if="processedText" class="processed-result">
          <h3>Processed Text Content</h3>
          <div class="text-preview">
            <div class="text-stats">
              <span class="text-size">{{ textSizeFormatted }}</span>
              <span class="text-length">{{ processedText.length.toLocaleString() }} characters</span>
            </div>
            <textarea 
              v-model="processedText" 
              readonly 
              class="processed-textarea"
              placeholder="Processed text will appear here..."
            ></textarea>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppButton from '~/components/AppButton.vue'
import AppIcon from '~/components/AppIcon.vue'

const processedText = ref('')

const textSizeFormatted = computed(() => {
  if (!processedText.value) return '0 Bytes'
  const byteLength = new TextEncoder().encode(processedText.value).length
  return formatFileSize(byteLength)
})

const handleError = (error: string) => {
  // Handle errors from the DigestFile component
  console.error('File processing error:', error)
}

const navigateToFAQ = () => {
  navigateTo('/faq')
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Set page metadata
definePageMeta({
  title: 'Document Upload & Processing'
})
</script>

<style scoped lang="scss">
@use "~/assets/_variables.scss" as *;

// Uses global .page-container for sizing

.upload-header {
  margin-bottom: 3rem;
  
  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    @media (max-width: 768px) {
      flex-direction: column;
      gap: 1rem;
    }
  }
  
  h1 {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 2.5rem;
    font-weight: 700;
    color: $text;
    margin: 0;
  }
}

.upload-content {
  display: grid;
  gap: 3rem;
}

.upload-section {
  background: $panel;
  border-radius: $radius;
  padding: 2rem;
  box-shadow: $shadow;

  .ai-note {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: $muted;
    margin: 0 0 1rem 0;
    font-size: 0.95rem;
  }
}

.processed-result {
  margin-top: 2rem;
  
  h3 {
    margin-bottom: 1rem;
    color: $text;
    font-size: 1.25rem;
  }
}

.text-preview {
  border: 1px solid $muted;
  border-radius: $radius;
  overflow: hidden;
}

.text-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: rgba($muted, 0.1);
  border-bottom: 1px solid $muted;
  font-size: 0.9rem;
  color: $muted;
  
  .text-size {
    font-weight: 600;
  }
}

.processed-textarea {
  width: 100%;
  min-height: 300px;
  padding: 1rem;
  border: none;
  background: $panel;
  color: $text;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 0.9rem;
  line-height: 1.5;
  resize: vertical;
  
  &:focus {
    outline: none;
  }
}

@media (max-width: 768px) {
  .upload-header {
    margin-bottom: 2rem;
    
    h1 {
      font-size: 2rem;
    }
  }
  
  .upload-section {
    padding: 1.5rem;
  }
}
</style>
