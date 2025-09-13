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
      
      <MegaForm
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
        console.log('Saving notification preferences:', data)
        // TODO: Implement API call to save notification config
        // await $sp.product.patch(productId, { notificationConfig: data.notificationConfig })
        useNuxtApp().$toast.show('Notification preferences saved successfully!', 'success')
        await navigateTo('/notifications')
      } catch (error) {
        console.error('Error saving notification preferences:', error)
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
    // TODO: Load current user's product and notification config
    // const product = await $sp.product.findOne({ ... })
    // if (product?.notificationConfig) {
    //   formData.value.notificationConfig = product.notificationConfig
    // }
  } catch (error) {
    console.error('Error loading notification preferences:', error)
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

@media (max-width: 768px) {
  .header {
    margin-bottom: 2rem;
    
    h1 {
      font-size: 1.75rem;
    }
  }
}
</style>