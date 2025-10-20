<template>
  <div>
    <div class="header">
      <div class="header-content">
        <AppButton :label="t('navigation.back')" color="secondary" :showBackIcon="true"
          @click="navigateToNotifications" />
        <h1>
          {{ t('page.title') }}
        </h1>
        <div></div> <!-- Spacer for flexbox alignment -->
      </div>
    </div>

    <div class="content">
      <p>{{ t('page.description') }}</p>

      <!-- Loading State -->
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>{{ t('states.loading') }}</p>
      </div>

      <!-- Form -->
      <MegaForm v-else :formClass="Product" :modelValue="formData" :includeFields="['notificationConfig']"
        :fieldOverrides="fieldOverrides" :actions="actions" @update:modelValue="updateFormData" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import MegaForm from '~/components/MegaForm.vue'
import AppButton from '~/components/AppButton.vue'
import { Product, NotificationConfig, NotificationSubConfig } from '~/eicrud_exports/services/SUPPORT-ms/product/product.entity'
import type { OverrideRecord, MegaFormAction } from '~/components/MegaForm.vue'

const { t } = await useLocalNamespaceAsync('edit-notifications')

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
        label: t('form.fields.promotionalEmails.label'),
        description: t('form.fields.promotionalEmails.description'),
        onLabel: t('form.common.yes'),
        offLabel: t('form.common.no')
      },
      exceededQuota: {
        label: t('form.fields.exceededQuota.label'),
        description: t('form.fields.exceededQuota.description'),
        nestedClass: NotificationSubConfig,
        nestedIncludeFields: ['bEmail'/*, 'bWhatsapp'*/],
        nestedFieldOverrides: {
          // bWhatsapp: {
          //   label: t('form.fields.whatsappNotifications'),
          //   onLabel: t('form.common.on'),
          //   offLabel: t('form.common.off')
          // },
          bEmail: {
            label: t('form.fields.emailNotifications'),
            onLabel: t('form.common.on'),
            offLabel: t('form.common.off')
          }
        }
      },
      lowBalance: {
        label: t('form.fields.lowBalance.label'),
        description: t('form.fields.lowBalance.description'),
        nestedClass: NotificationSubConfig,
        nestedIncludeFields: ['bEmail'/*, 'bWhatsapp'*/],
        nestedFieldOverrides: {
          // bWhatsapp: {
          //   label: t('form.fields.whatsappNotifications'),
          //   onLabel: t('form.common.on'),
          //   offLabel: t('form.common.off')
          // },
          bEmail: {
            label: t('form.fields.emailNotifications'),
            onLabel: t('form.common.on'),
            offLabel: t('form.common.off')
          }
        }
      },
      newIssues: {
        label: t('form.fields.newIssues.label'),
        description: t('form.fields.newIssues.description'),
        nestedClass: NotificationSubConfig,
        nestedIncludeFields: ['bEmail'/*, 'bWhatsapp'*/],

        nestedFieldOverrides: {
          // bWhatsapp: {
          //   label: t('form.fields.whatsappNotifications'),
          //   onLabel: t('form.common.on'),
          //   offLabel: t('form.common.off')
          // },
          bEmail: {
            label: t('form.fields.emailNotifications'),
            onLabel: t('form.common.on'),
            offLabel: t('form.common.off')
          }
        }
      }
    }
  }
}

// Form actions
const actions: MegaFormAction[] = [
  {
    label: t('form.actions.save'),
    color: 'primary',
    callback: async (data: Partial<Product>) => {
      try {
        const nuxtApp = useNuxtApp()
        const productId = nuxtApp.$userProductId

        if (!productId) {
          throw new Error(t('errors.noProductId'))
        }

        // Update the product with new notification config
        await nuxtApp.$sp.product.patchOne({
          id: productId
        }, {
          notificationConfig: data.notificationConfig
        })

        nuxtApp.$toast.show(t('messages.savedSuccess'), 'success')
      } catch (error) {
        console.error('Error saving notification preferences:', error)
        useNuxtApp().$toast.show(t('errors.saveFailed'), 'error')
        throw error
      }
    }
  },
  {
    label: t('form.actions.cancel'),
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
      throw new Error(t('errors.noProductId'))
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
    useNuxtApp().$toast.show(t('errors.loadFailed'), 'error')
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
    0% {
      transform: rotate(0deg);
    }

    100% {
      transform: rotate(360deg);
    }
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