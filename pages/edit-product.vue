<template>
  <div class="page-container edit-product-page">
    <header class="page-header">
      <div class="page-title">
        <h1>{{ isEditing ? 'Edit Product' : 'Create New Product' }}</h1>
      </div>
    </header>

    <div class="content-section">
      
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading product...</p>
      </div>
      
      <MegaForm
        v-else
        :formClass="Product"
        v-model="formData"
        :fieldOverrides="fieldOverrides"
        :includeFields="includeFields"
        :actions="actions"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import MegaForm, { FieldOverride, MegaFormAction, MegaFormProps, OverrideRecord } from '~/components/MegaForm.vue'
import { Product } from '~/eicrud_exports/services/SUPPORT-ms/product/product.entity'
import { ref, onMounted, computed } from 'vue'

definePageMeta({ layout: 'default' })

const router = useRouter()
const nuxtApp = useNuxtApp() // Capture nuxtApp in setup context
const { colors } = useTheme() // Import theme colors

// Use the user's product ID from nuxtApp
const productId = computed(() => nuxtApp.$userProductId as string)
const isEditing = computed(() => !!productId.value)
const isLoading = ref(false)
const currentProduct = ref<Product | null>(null)

// Include fields we want to show in the form
const includeFields = computed(() => {
  return ['name', 'description', 'webhookUrl', 'sharedSecret','chatOn', 'version']
})

const formData = ref({
  name: '',
  description: '',
  webhookUrl: '',
  sharedSecret: '',
  chatOn: true,
})

// Load existing product if editing
const loadProduct = async () => {
  if (!productId.value) return
  
  isLoading.value = true
  try {
    console.log("Loading product with ID:", productId.value);
    const product = await nuxtApp.$sp.product.findOne({ 
      id: productId.value, 
    })
    if (product) {
      currentProduct.value = product
      // Populate form data with existing product data
      formData.value = {
        name: product.name || '',
        description: product.description || '',
        webhookUrl: product.webhookUrl || '',
        sharedSecret: product.sharedSecret || '',
        chatOn: product.chatOn || false,
      }
    }
  } catch (error) {
    console.error('Failed to load product:', error)
    nuxtApp.$toast.show(error, 'error')
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  if (productId.value) {
    loadProduct()
  }
})

const fieldOverrides: OverrideRecord<Product> = {
  name: {
    label: 'Product Name',
    placeholder: 'e.g. My Support Agent',
    description: 'A unique name for your AI support agent product'
  },
  chatOn: {
    label: 'AI Chat Feature',
    description: 'Enable or disable AI chat functionality for this product',
    titleColor: () => !formData.value.chatOn ? colors.error() : undefined,
  },
  description: {
    maxChars: 4000,
    label: 'Product Description',
    type: 'richtext',
    description: `1. What your product is and does.  
2. A few marketing arguments to sell the product + your pricing model.  
3. A general overview on how to use your product.  
`,
  },
  webhookUrl: {
    label: 'Webhook URL',
    placeholder: 'https://yoursite.com/api/validate-token',
    description: 'URL endpoint for validating user tokens for authenticated users'
  },
  sharedSecret: {
    label: 'Shared Secret',
    placeholder: 'Your webhook shared secret',
    description: 'Secret key used to secure webhook requests between your system and ours'
  }
}

const actions: MegaFormAction[] = [
  {
    label: isEditing.value ? 'Update Product' : 'Create Product',
    color: 'primary',
    margin: 'right',
    callback: async (data: any) => {
      data.owner = nuxtApp.$userId;
      
      if (isEditing.value && productId.value) {
        // Update existing product
        const updateData = { ...data }
        delete updateData.owner; 
        console.log("Updating product with data:", updateData);
        const res = await nuxtApp.$sp.product.patch({ 
          id: productId.value, 
          owner: nuxtApp.$userId 
        }, updateData);
        nuxtApp.$toast.show('Product updated!', 'success')
      } else {
        // Create new product
        console.log("Creating product with data:", data);
        const res = await nuxtApp.$sp.product.create(data);
        nuxtApp.$toast.show('Product created!', 'success')
        // Reload the page to show the created product
        window.location.reload()
      }
    }
  },
]
</script>

<style scoped lang="scss">
@use '~/assets/variables' as *;

// Uses global .page-container for sizing

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
}

.page-description {
  color: $muted;
  margin: 0 0 2rem 0;
  font-size: 0.9rem;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  color: $muted;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba($brand, 0.1);
  border-top: 3px solid $brand;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

// Mobile responsive
@media (max-width: 768px) {
  .content-section {
    padding: 1rem;
  }
}
</style>
