<template>
  <div class="coming-soon-page">
    <div class="coming-soon-container">
      <div class="coming-soon-header">
        <a href="https://directsupport.ai" class="auth-logo">
          <i class="fas fa-rocket"></i>
          <h1>DirectSupport.ai</h1>
        </a>
        <h2 class="coming-soon-title">{{ t('coming-soon.page.title') }}</h2>
        <p class="coming-soon-subtitle">{{ t('coming-soon.page.subtitle') }}</p>
      </div>

      <div class="signup-form">
        <h3>{{ t('coming-soon.signup.title') }}</h3>
        <MegaForm
          :formClass="WaitingList"
          v-model="formData"
          :fieldOverrides="fieldOverrides"
          :includeFields="['email', 'acceptPrivacyPolicy']"
          :actions="actions"
        />
      </div>

      <div class="features-preview">
        <h4>{{ t('coming-soon.features.title') }}</h4>
        <ul class="feature-list">
          <li><i class="fas fa-check"></i> {{ t('coming-soon.features.list.embeddedChat') }}</li>
          <li><i class="fas fa-check"></i> {{ t('coming-soon.features.list.whatsapp') }}</li>
          <li><i class="fas fa-check"></i> {{ t('coming-soon.features.list.knowledgeBase') }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import MegaForm, { type MegaFormAction } from '~/components/MegaForm.vue'
import { WaitingList } from '~/eicrud_exports/services/waiting-list/waiting-list.entity'
import { ref } from 'vue'

definePageMeta({ layout: 'bare' })

// Composables
const { t } = useLocalNamespace('coming-soon')

// Meta
useHead({
  title: () => t('coming-soon.meta.title')
})

const formData = ref({
  email: '',
  acceptPrivacyPolicy: false
})

const fieldOverrides = {
  email: {
    type: 'email',
    label: t('coming-soon.signup.email.label'),
    placeholder: t('coming-soon.signup.email.placeholder')
  },
  acceptPrivacyPolicy: {
    type: 'checkbox',
    label: t('coming-soon.signup.privacyPolicy.label'),
    required: true
  }
}

const actions: MegaFormAction[] = [
  {
    label: t('coming-soon.signup.button'),
    color: 'primary',
    margin: 'right',
    callback: async (data: any) => {
      try {
        // Check if privacy policy is accepted
        if (!data.acceptPrivacyPolicy) {
          useNuxtApp().$toast.show(t('coming-soon.messages.privacyRequired'), 'error')
          return
        }

        // Create waiting list entry
        const waitingListData = {
          email: data.email
        }

        await useNuxtApp().$sp.waitingList.create(waitingListData)
        
        useNuxtApp().$toast.show(t('coming-soon.messages.success'), 'success')
        
        // Reset form
        formData.value = {
          email: '',
          acceptPrivacyPolicy: false
        }
      } catch (error) {
        useNuxtApp().$toast.show(error, 'error')
      }
    }
  }
]
</script>

<style scoped lang="scss">
@use '~/assets/variables' as *;

.coming-soon-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.coming-soon-container {
  background: $panel;
  border-radius: $radius;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  padding: 3rem;
  max-width: 500px;
  width: 100%;
  text-align: center;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.coming-soon-header {
  margin-bottom: 2.5rem;
}

.auth-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  text-decoration: none;
  transition: opacity 0.3s ease;
  
  &:hover {
    opacity: 0.8;
  }
  
  i {
    font-size: 2.5rem;
    color: $brand;
    animation: pulse 2s infinite;
  }
  
  h1 {
    margin: 0;
    color: $text;
    font-size: 2rem;
    font-weight: bold;
    background: linear-gradient(135deg, $brand 0%, $brand-2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.coming-soon-title {
  margin: 0 0 1rem 0;
  color: $text;
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, $brand 0%, $brand-2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.coming-soon-subtitle {
  margin: 0 0 1.5rem 0;
  color: $muted;
  font-size: 1.1rem;
  line-height: 1.6;
}

.signup-form {
  background: rgba($bg, 0.5);
  border-radius: $radius;
  padding: 2rem;
  margin-bottom: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
  
  h3 {
    margin: 0 0 1.5rem 0;
    color: $text;
    font-size: 1.3rem;
    font-weight: 600;
  }
}

.features-preview {
  text-align: left;
  
  h4 {
    margin: 0 0 1rem 0;
    color: $text;
    font-size: 1.1rem;
    font-weight: 600;
    text-align: center;
  }
}

.feature-list {
  list-style: none;
  padding: 0;
  margin: 0;
  
  li {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 0;
    color: $muted;
    font-size: 0.95rem;
    
    i {
      color: $brand;
      font-size: 0.8rem;
      width: 16px;
      flex-shrink: 0;
    }
  }
}

/* Mobile responsive */
@media (max-width: 768px) {
  .coming-soon-container {
    padding: 2rem 1.5rem;
    margin: 1rem;
  }
  
  .coming-soon-title {
    font-size: 2rem;
  }
  
  .auth-logo {
    h1 {
      font-size: 1.6rem;
    }
    
    i {
      font-size: 2rem;
    }
  }
  
  .signup-form {
    padding: 1.5rem;
  }
}

@media (max-width: 480px) {
  .coming-soon-container {
    padding: 1.5rem 1rem;
  }
  
  .coming-soon-title {
    font-size: 1.8rem;
  }
  
  .coming-soon-subtitle {
    font-size: 1rem;
  }
}
</style>