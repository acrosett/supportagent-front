<template>
  <div>
    <div class="header">
      <div class="header-content">
        <AppButton
          label="Back to Notifications"
          color="secondary"
          :showBackIcon="true"
          @click="navigateToNotifications"
        />
        <h1>
          Notification Preferences
        </h1>
        <div></div> <!-- Spacer for flexbox alignment -->
      </div>
    </div>

    <div class="content">
      <p>Configure how and when you want to receive notifications for your products.</p>
      
      <!-- Loading State -->
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading notification preferences...</p>
      </div>
      
      <!-- Form -->
      <MegaForm
        v-else
        :formClass="Product"
        :modelValue="formData"
        :includeFields="['notificationConfig']"
        :fieldOverrides="fieldOverrides"
        :actions="actions"
        @update:modelValue="updateFormData"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import MegaForm from '~/components/MegaForm.vue'
import AppButton from '~/components/AppButton.vue'
import { Product, NotificationConfig, NotificationSubConfig } from '~/eicrud_exports/services/SUPPORT-ms/product/product.entity'
import type { OverrideRecord, MegaFormAction } from '~/components/MegaForm.vue'

// Form data
const formData = ref<Partial<Product>>({
  notificationConfig: new NotificationConfig()
})

// Loading state
const isLoading = ref(true)

// Update form data
function updateFormData(newData: Partial<Product>) {
  formData.value = { ...newData }
}

// Navigation function
function navigateToNotifications() {
  navigateTo('/notifications')
}

// Field overrides for nested configuration
const fieldOverrides: OverrideRecord<Product> = {
  notificationConfig: {
    nestedClass: NotificationConfig,
    nestedIncludeFields: ['promotionalEmails', 'exceededQuota', 'lowBalance', 'newIssues'],
    nestedFieldOverrides: {
      promotionalEmails: {
        label: 'Promotional Emails',
        description: 'Receive promotional emails and updates',
        onLabel: 'Yes',
        offLabel: 'No'
      },
      exceededQuota: {
        label: 'Quota Exceeded Alerts',
        description: 'Get notified when usage quotas are exceeded',
        nestedClass: NotificationSubConfig,
        nestedFieldOverrides: {
          bWhatsapp: {
            label: 'WhatsApp Notifications',
            onLabel: 'On',
            offLabel: 'Off'
          },
          bEmail: {
            label: 'Email Notifications',
            onLabel: 'On',
            offLabel: 'Off'
          }
        }
      },
      lowBalance: {
        label: 'Low Balance Alerts',
        description: 'Get notified when account balance is low',
        nestedClass: NotificationSubConfig,
        nestedFieldOverrides: {
          bWhatsapp: {
            label: 'WhatsApp Notifications',
            onLabel: 'On',
            offLabel: 'Off'
          },
          bEmail: {
            label: 'Email Notifications',
            onLabel: 'On',
            offLabel: 'Off'
          }
        }
      },
      newIssues: {
        label: 'New Issue Alerts',
        description: 'Get notified about new issues or problems',
        nestedClass: NotificationSubConfig,
        nestedFieldOverrides: {
          bWhatsapp: {
            label: 'WhatsApp Notifications',
            onLabel: 'On',
            offLabel: 'Off'
          },
          bEmail: {
            label: 'Email Notifications',
            onLabel: 'On',
            offLabel: 'Off'
          }
        }
      }
    }
  }
}

// Form actions
const actions: MegaFormAction[] = [
  {
    label: 'Save Notification Preferences',
    color: 'primary',
    callback: async (data: Partial<Product>) => {
      try {
        const nuxtApp = useNuxtApp()
        const productId = nuxtApp.$userProductId
        
        if (!productId) {
          throw new Error('Product ID not found')
        }
        
        // Update the product with new notification config
        await nuxtApp.$sp.product.patchOne({
          id: productId
        }, {
          notificationConfig: data.notificationConfig
        })
        
        nuxtApp.$toast.show('Notification preferences saved successfully!', 'success')
      } catch (error) {
        console.error('Error saving notification preferences:', error)
        useNuxtApp().$toast.show('Failed to save notification preferences', 'error')
        throw error
      }
    }
  },
  {
    label: 'Cancel',
    color: 'secondary',
    margin: 'left',
    skipValidation: true,
    callback: async () => {
      await navigateTo('/notifications')
    }
  }
]

// Load current user's product data on mount
onMounted(async () => {
  try {
    const nuxtApp = useNuxtApp()
    const productId = nuxtApp.$userProductId
    
    if (!productId) {
      throw new Error('Product ID not found')
    }
    
    // Load current user's product and notification config
    const product = await nuxtApp.$sp.product.findOne({ 
      id: productId 
    })
    
    if (product) {
      // Initialize notification config if it doesn't exist
      const notificationConfig = product.notificationConfig || new NotificationConfig()
      
      // Ensure all nested configs exist with proper defaults
      if (!notificationConfig.exceededQuota) {
        notificationConfig.exceededQuota = new NotificationSubConfig()
      }
      if (!notificationConfig.lowBalance) {
        notificationConfig.lowBalance = new NotificationSubConfig()
      }
      if (!notificationConfig.newIssues) {
        notificationConfig.newIssues = new NotificationSubConfig()
      }
      
      formData.value = {
        ...product,
        notificationConfig
      }
    }
  } catch (error) {
    console.error('Error loading notification preferences:', error)
    useNuxtApp().$toast.show('Failed to load notification preferences', 'error')
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
.header {
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
    font-size: 2rem;
    font-weight: 700;
    color: var(--text);
    margin: 0;
  }
}

.content {
  display: grid;
  gap: 2rem;
}

p {
  color: var(--text-secondary);
  margin: 0;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 1rem;
  color: var(--text-secondary);
  
  .spinner {
    width: 32px;
    height: 32px;
    border: 3px solid rgba(110, 231, 255, 0.2);
    border-top: 3px solid #6ee7ff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  p {
    margin: 0;
    font-size: 0.9rem;
  }
}

@media (max-width: 768px) {
  .header {
    margin-bottom: 2rem;
    
    h1 {
      font-size: 1.75rem;
    }
  }
}
</style>