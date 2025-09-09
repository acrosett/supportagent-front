<template>
  <div class="page-container faq-page">
    <div class="faq-header">
      <h1>
        FAQ Management
      </h1>
    </div>

    <div class="faq-content">
      <FaqManager />
    </div>
  </div>
</template>

<script setup lang="ts">
import FaqManager from '@/components/FaqManager.vue'

// Set page metadata
definePageMeta({
  title: 'FAQ Management'
})
</script>

<style scoped lang="scss">
@use "~/assets/_variables.scss" as *;

// Uses global .page-container for sizing

.faq-header {
  margin-bottom: 3rem;
  
  h1 {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 2rem;
    font-weight: 700;
    color: $text;
    margin: 0;
  }
  
  p {
    font-size: 1.2rem;
    color: $muted;
    max-width: 600px;
    margin: 0 auto;
  }
}

.faq-content {
  display: grid;
  gap: 3rem;
}

.faq-section {
  h2 {
    margin-bottom: 2rem;
    color: $text;
    font-size: 1.75rem;
    text-align: center;
  }
}

.faq-item {
  background: $panel;
  border-radius: $radius;
  padding: 1.5rem;
  margin-bottom: 1rem;
  box-shadow: $shadow;
  
  h3 {
    color: $brand-2;
    font-size: 1.25rem;
    margin-bottom: 0.75rem;
    font-weight: 600;
  }
  
  p {
    color: $text;
    line-height: 1.6;
    margin: 0;
  }
}

@media (max-width: 768px) {
  .faq-header {
    margin-bottom: 2rem;
    
    h1 {
      font-size: 2rem;
    }
    
    p {
      font-size: 1rem;
    }
  }
  
  .upload-section {
    padding: 1.5rem;
  }
  
  .faq-item {
    padding: 1rem;
  }
}
</style>
