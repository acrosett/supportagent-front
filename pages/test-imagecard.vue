<template>
  <div class="image-card-test page-container">
    <div class="page-header">
      <h1>{{ t('page.title') }}</h1>
      <p>{{ t('page.description') }}</p>
    </div>
    
    <div class="test-grid">
      <!-- Full content card -->
      <div class="test-section">
        <h3>{{ t('sections.fullContent') }}</h3>
        <ImageCard
          :title="t('cards.fullContent.title')"
          :description="t('cards.fullContent.description')"
          image="https://picsum.photos/300/400?random=1"
          :price="25"
          :meta="[
            { label: t('metadata.date1'), icon: 'time' },
            { label: t('metadata.views1'), icon: 'views' }
          ]"
          :actions="[
            { label: t('actions.edit'), icon: 'edit', color: 'secondary', handler: handleEditClick }
          ]"
        />
      </div>
      
      <!-- Image only card -->
      <div class="test-section">
        <h3>{{ t('sections.imageOnly') }}</h3>
        <ImageCard
          image="https://picsum.photos/300/400?random=2"
        />
      </div>
      
      <!-- Title only card -->
      <div class="test-section">
        <h3>{{ t('sections.titleOnly') }}</h3>
        <ImageCard
          :title="t('cards.titleOnly.title')"
          image="https://picsum.photos/300/400?random=3"
        />
      </div>
      
      <!-- No image card -->
      <div class="test-section">
        <h3>{{ t('sections.noImage') }}</h3>
        <ImageCard
          :title="t('cards.noImage.title')"
          :description="t('cards.noImage.description')"
          :meta="[
            { label: t('metadata.missingImage'), icon: 'calendar' }
          ]"
        />
      </div>
      
      <!-- Minimal content card -->
      <div class="test-section">
        <h3>{{ t('sections.minimal') }}</h3>
        <ImageCard
          :title="t('cards.minimal.title')"
          image="https://picsum.photos/300/400?random=4"
        />
      </div>
      
      <!-- Only metadata card -->
      <div class="test-section">
        <h3>{{ t('sections.onlyMetadata') }}</h3>
        <ImageCard
          image="https://picsum.photos/300/400?random=5"
          :meta="[
            { label: t('metadata.date2'), icon: 'time' }
          ]"
        />
      </div>
      
      <!-- Different aspect ratio images -->
      <div class="test-section">
        <h3>{{ t('sections.landscape') }}</h3>
        <ImageCard
          :title="t('cards.landscape.title')"
          :description="t('cards.landscape.description')"
          image="https://picsum.photos/600/300?random=6"
          :price="15"
        />
      </div>
      
      <!-- Square image -->
      <div class="test-section">
        <h3>{{ t('sections.square') }}</h3>
        <ImageCard
          :title="t('cards.square.title')"
          :description="t('cards.square.description')"
          image="https://picsum.photos/400/400?random=7"
          :meta="[
            { label: t('metadata.timeAgo1'), icon: 'time' }
          ]"
        />
      </div>
      
      <!-- Portrait image -->
      <div class="test-section">
        <h3>{{ t('sections.portrait') }}</h3>
        <ImageCard
          :title="t('cards.portrait.title')"
          image="https://picsum.photos/300/600?random=8"
        />
      </div>
      
      <!-- Long text test -->
      <div class="test-section">
        <h3>{{ t('sections.longContent') }}</h3>
        <ImageCard
          :title="t('cards.longContent.title')"
          :description="t('cards.longContent.description')"
          image="https://picsum.photos/300/400?random=9"
          :price="99"
          :meta="[
            { label: t('metadata.timeAgo2'), icon: 'time' },
            { label: t('metadata.views2'), icon: 'views' }
          ]"
        />
      </div>
    </div>
    
    <div class="feature-notes">
      <h2>{{ t('features.title') }}</h2>
      <ul>
        <li>✅ <strong>{{ t('features.list.optional') }}</strong></li>
        <li>✅ <strong>{{ t('features.list.fixedDimensions') }}</strong></li>
        <li>✅ <strong>{{ t('features.list.responsiveImages') }}</strong></li>
        <li>✅ <strong>{{ t('features.list.textOverflow') }}</strong></li>
        <li>✅ <strong>{{ t('features.list.imageCropping') }}</strong></li>
        <li>✅ <strong>{{ t('features.list.clickPreview') }}</strong></li>
        <li>✅ <strong>{{ t('features.list.flexibleLayout') }}</strong></li>
        <li>✅ <strong>{{ t('features.list.accessibility') }}</strong></li>
      </ul>
      
      <div class="technical-note">
        <h3>{{ t('features.technicalNote.title') }}</h3>
        <p>{{ t('features.technicalNote.description') }}</p>
        <p><strong>{{ t('features.technicalNote.aspectRatios') }}</strong></p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Set page meta
definePageMeta({
  title: 'ImageCard Tests',
  layout: 'default'
})

const { t } = useLocalNamespace('test-imagecard')

const handleEditClick = () => {
  console.log('Edit button clicked!')
}
</script>

<style scoped lang="scss">
@use '~/assets/variables' as *;

.page-header {
  margin-bottom: 3rem;
  text-align: center;
  
  h1 {
    font-size: 2.5rem;
    font-weight: 600;
    color: $text;
    margin: 0 0 1rem 0;
  }
  
  p {
    color: $muted;
    font-size: 1.1rem;
    margin: 0;
  }
}

.test-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
  
  // Ensure all cards in the grid have consistent sizing
  .test-section {
    display: flex;
    flex-direction: column;
    
    h3 {
      font-size: 1rem;
      font-weight: 600;
      color: $text;
      margin: 0 0 1rem 0;
      text-align: center;
      padding: 0.5rem;
      background: rgba($brand, 0.1);
      border-radius: 6px;
      flex-shrink: 0;
    }
    
    // The ImageCard should take up the remaining space and have consistent height
    :deep(.image-card) {
      flex: 1;
    }
  }
}

.feature-notes {
  background: $panel;
  border-radius: 12px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.06);
  
  h2 {
    font-size: 1.5rem;
    font-weight: 600;
    color: $text;
    margin: 0 0 1.5rem 0;
  }
  
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    
    li {
      padding: 0.75rem 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      color: $muted;
      line-height: 1.5;
      
      &:last-child {
        border-bottom: none;
      }
      
      strong {
        color: $text;
      }
    }
  }
  
  .technical-note {
    margin-top: 2rem;
    padding: 1.5rem;
    background: rgba($brand, 0.05);
    border-left: 4px solid $brand;
    border-radius: 0 8px 8px 0;
    
    h3 {
      font-size: 1.1rem;
      font-weight: 600;
      color: $text;
      margin: 0 0 1rem 0;
    }
    
    p {
      margin: 0;
      color: $muted;
      line-height: 1.6;
    }
    
    code {
      background: rgba($brand, 0.1);
      color: $brand;
      padding: 0.2rem 0.4rem;
      border-radius: 4px;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 0.875rem;
    }
  }
}

// Mobile responsive
@media (max-width: 768px) {
  .image-card-test {
    padding: 1rem;
  }
  
  .test-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .page-header h1 {
    font-size: 2rem;
  }
}
</style>
