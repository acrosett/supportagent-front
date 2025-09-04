<template>
  <div class="image-card-test">
    <div class="page-header">
      <h1>ImageCard Component Tests</h1>
      <p>Testing the enhanced ImageCard component with real images from Picsum Photos to demonstrate cropping and responsive sizing</p>
    </div>
    
    <div class="test-grid">
      <!-- Full content card -->
      <div class="test-section">
        <h3>Full Content Card</h3>
        <ImageCard
          title="Complete Media Item"
          description="This card has all the information including title, description, price, and metadata."
          image="https://picsum.photos/300/400?random=1"
          :price="25"
          :meta="[
            { label: 'Jan 22, 2024', icon: 'time' },
            { label: '143 views', icon: 'views' }
          ]"
          :actions="[
            { label: 'Edit', icon: 'edit', color: 'secondary', handler: handleEditClick }
          ]"
        />
      </div>
      
      <!-- Image only card -->
      <div class="test-section">
        <h3>Image Only Card</h3>
        <ImageCard
          image="https://picsum.photos/300/400?random=2"
        />
      </div>
      
      <!-- Title only card -->
      <div class="test-section">
        <h3>Title Only Card</h3>
        <ImageCard
          title="Just a Title"
          image="https://picsum.photos/300/400?random=3"
        />
      </div>
      
      <!-- No image card -->
      <div class="test-section">
        <h3>No Image Card</h3>
        <ImageCard
          title="No Image Available"
          description="This card demonstrates what happens when there's no image provided."
          :meta="[
            { label: 'Missing image', icon: 'calendar' }
          ]"
        />
      </div>
      
      <!-- Minimal content card -->
      <div class="test-section">
        <h3>Minimal Content</h3>
        <ImageCard
          title="Minimal"
          image="https://picsum.photos/300/400?random=4"
        />
      </div>
      
      <!-- Only metadata card -->
      <div class="test-section">
        <h3>Only Metadata</h3>
        <ImageCard
          image="https://picsum.photos/300/400?random=5"
          :meta="[
            { label: 'Jan 15, 2024', icon: 'time' }
          ]"
        />
      </div>
      
      <!-- Different aspect ratio images -->
      <div class="test-section">
        <h3>Landscape Image</h3>
        <ImageCard
          title="Wide Landscape"
          description="This image is wider than it is tall - you'll see how it crops."
          image="https://picsum.photos/600/300?random=6"
          :price="15"
        />
      </div>
      
      <!-- Square image -->
      <div class="test-section">
        <h3>Square Image</h3>
        <ImageCard
          title="Perfect Square"
          description="This is a square image to test different aspect ratios."
          image="https://picsum.photos/400/400?random=7"
          :meta="[
            { label: '2 hours ago', icon: 'time' }
          ]"
        />
      </div>
      
      <!-- Portrait image -->
      <div class="test-section">
        <h3>Portrait Image</h3>
        <ImageCard
          title="Tall Portrait"
          image="https://picsum.photos/300/600?random=8"
        />
      </div>
      
      <!-- Long text test -->
      <div class="test-section">
        <h3>Long Content Test</h3>
        <ImageCard
          title="Very Long Title That Should Get Truncated With Ellipsis"
          description="This is a very long description that should be clamped to only show a few lines to test that the card height remains consistent even with lots of text content that could potentially break the layout."
          image="https://picsum.photos/300/400?random=9"
          :price="99"
          :meta="[
            { label: 'Long text test', icon: 'time' },
            { label: '999+ views', icon: 'views' }
          ]"
        />
      </div>
    </div>
    
    <div class="feature-notes">
      <h2>New Features</h2>
      <ul>
        <li>✅ <strong>All props are now optional</strong> - You can create cards with any combination of content</li>
        <li>✅ <strong>Fixed card dimensions</strong> - All cards have exactly the same height (400px) and width in any grid</li>
        <li>✅ <strong>Responsive image sizing</strong> - Image section grows/shrinks based on content below, while maintaining card consistency</li>
        <li>✅ <strong>Text overflow handling</strong> - Titles are truncated with ellipsis, descriptions are clamped to 3 lines max</li>
        <li>✅ <strong>Image cropping (not resizing)</strong> - Images use object-fit: cover to crop and center, preserving aspect ratio</li>
        <li>✅ <strong>Click to preview</strong> - Click on any image to see the full, uncropped version in a popup</li>
        <li>✅ <strong>Flexible layout</strong> - Content section only appears when there's content to display</li>
        <li>✅ <strong>Better accessibility</strong> - Proper alt text fallbacks and keyboard navigation</li>
      </ul>
      
      <div class="technical-note">
        <h3>How the image sizing works:</h3>
        <p>Each card has a fixed height (400px). The image section uses <code>flex: 1</code> to grow and fill whatever space is left after the content section takes what it needs. The image itself uses <code>object-fit: cover</code> to crop (not resize) and center within its container.</p>
        <p><strong>Notice the different aspect ratios:</strong> The landscape, square, and portrait images from Picsum Photos all get cropped to fit their containers perfectly, maintaining their original quality while adapting to the available space.</p>
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

const handleEditClick = () => {
  console.log('Edit button clicked!')
}
</script>

<style scoped lang="scss">
@use '~/assets/variables' as *;

.image-card-test {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

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
