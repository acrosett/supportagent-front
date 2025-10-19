<template>
  <div class="auth-page">
    <div class="auth-header">
      <div class="auth-logo">
        <i class="fas fa-robot"></i>
        <h1>DirectSupport.ai</h1>
      </div>
      <h2 class="auth-title">{{ $t('page.title') }}</h2>
      <p class="auth-subtitle">{{ $t(subtitleKey) }}</p>
    </div>

    <div class="verification-status">
      <!-- Loading State -->
      <div v-if="isVerifying" class="status-card loading">
        <div class="status-icon">
          <i class="fas fa-spinner fa-spin"></i>
        </div>
        <h3>{{ $t('status.loading.title') }}</h3>
        <p>{{ $t('status.loading.message') }}</p>
      </div>

      <!-- Success State -->
      <div v-else-if="verificationResult === 'success'" class="status-card success">
        <div class="status-icon">
          <i class="fas fa-check-circle"></i>
        </div>
        <h3>{{ $t('status.success.title') }}</h3>
        <p>{{ $t('status.success.message') }}</p>
        <div class="status-actions">
          <button class="auth-button primary" @click="goToAccount">
            {{ $t('buttons.goToAccount') }}
          </button>
          <button class="auth-button secondary" @click="goToHome">
            {{ $t('buttons.goToDashboard') }}
          </button>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="verificationResult === 'error'" class="status-card error">
        <div class="status-icon">
          <i class="fas fa-times-circle"></i>
        </div>
        <h3>{{ $t('status.error.title') }}</h3>
        <p>{{ errorMessage }}</p>
        <div class="status-actions">
          <button class="auth-button primary" @click="resendVerification">
            {{ $t('buttons.resendVerification') }}
          </button>
          <button class="auth-button secondary" @click="goToAccount">
            {{ $t('buttons.goToAccount') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { VerifyEmailDto } from '~/eicrud_exports/services/user/cmds/verify_email/verify_email.dto'
import { ref, computed, onMounted } from 'vue'

definePageMeta({ layout: 'bare' })

// Get token_id from URL query params
const route = useRoute()
const router = useRouter()
import { useLocalNamespace } from '~/composables/useLocalNamespace'
const { t } = useLocalNamespace('verify-email')
const tokenId = computed(() => route.query.token_id as string || null)

// Reactive state
const isVerifying = ref(false)
const verificationResult = ref<'success' | 'error' | null>(null)
const errorMessage = ref('')

// Computed subtitle text
const subtitleKey = computed(() => {
  if (isVerifying.value) {
    return 'verifyEmail.page.subtitleProcessing'
  } else if (verificationResult.value === 'success') {
    return 'verifyEmail.page.subtitleSuccess'
  } else if (verificationResult.value === 'error') {
    return 'verifyEmail.page.subtitleError'
  } else {
    return 'verifyEmail.page.subtitleDefault'
  }
})

// Verify email function
const verifyEmail = async () => {
  if (!tokenId.value) {
    console.warn('No token_id found, redirecting to home')
    await useNuxtApp().$confirmPopup.showInfo(t('messages.noToken'))
    await router.push('/')
    return
  }

  isVerifying.value = true
  verificationResult.value = null
  errorMessage.value = ''

  try {
    const verifyData: VerifyEmailDto = {
      token_id: tokenId.value,
      logMeIn: false // Don't log in automatically, just verify
    }

    const result = await useNuxtApp().$sp.user.verify_email_extendedS(verifyData)
    
    if (result) {
      verificationResult.value = 'success'
      useNuxtApp().$toast.show(t('messages.success'), 'success')
    } else {
      throw new Error('Verification failed')
    }
  } catch (error) {
    console.error('Email verification failed:', error)
    verificationResult.value = 'error'
    
    // Set appropriate error message based on error type
    if (error instanceof Error) {
      if (error.message.includes('expired') || error.message.includes('invalid')) {
        errorMessage.value = t('messages.error.expired')
      } else if (error.message.includes('already verified')) {
        errorMessage.value = t('messages.error.alreadyVerified')
      } else {
        errorMessage.value = t('messages.error.failed')
      }
    } else {
      errorMessage.value = t('messages.error.unexpected')
    }
    
    useNuxtApp().$toast.show(errorMessage.value, 'error')
  } finally {
    isVerifying.value = false
  }
}

// Navigation functions
const goToHome = () => {
  router.push('/')
}

const goToAccount = () => {
  router.push('/account')
}

const resendVerification = async () => {
  try {
    // Note: send_verification_email requires newEmail and password
    // This might need to be handled differently in your application
    // For now, we'll redirect to account page where user can manage email verification
    useNuxtApp().$toast.show(t('messages.resendInfo'), 'info')
    await router.push('/account')
  } catch (error) {
    console.error('Failed to handle verification resend:', error)
    useNuxtApp().$toast.show(t('messages.resendError'), 'error')
  }
}

// Check for token and redirect if not present, otherwise verify automatically
onMounted(async () => {
  if (!tokenId.value) {
    console.warn('No token_id provided, redirecting to home')
    await useNuxtApp().$confirmPopup.showInfo(t('messages.noToken'))
    await router.push('/')
    return
  }
  
  // Automatically start verification process
  await verifyEmail()
})
</script>

<style scoped lang="scss">
@use '~/assets/variables' as *;
@use 'sass:color';

.auth-page {
  max-width: 500px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.auth-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  
  i {
    font-size: 2rem;
    color: $brand;
  }
  
  h1 {
    margin: 0;
    color: $text;
    font-size: 1.8rem;
    font-weight: bold;
  }
}

.auth-title {
  margin: 0 0 0.5rem 0;
  color: $text;
  font-size: 1.5rem;
  font-weight: 600;
}

.auth-subtitle {
  margin: 0 0 1.5rem 0;
  color: $muted;
  font-size: 1rem;
}

.verification-status {
  display: flex;
  justify-content: center;
}

.status-card {
  background: $panel;
  border-radius: $radius;
  box-shadow: $shadow;
  padding: 2rem;
  text-align: center;
  width: 100%;
  max-width: 400px;
  
  &.loading {
    border-left: 4px solid $brand;
  }
  
  &.success {
    border-left: 4px solid #10b981; // Green
  }
  
  &.error {
    border-left: 4px solid $error;
  }
}

.status-icon {
  margin-bottom: 1rem;
  
  i {
    font-size: 3rem;
  }
  
  .loading & i {
    color: $brand;
  }
  
  .success & i {
    color: #10b981; // Green
  }
  
  .error & i {
    color: $error;
  }
}

.status-card h3 {
  margin: 0 0 1rem 0;
  color: $text;
  font-size: 1.3rem;
  font-weight: 600;
}

.status-card p {
  margin: 0 0 1.5rem 0;
  color: $muted;
  line-height: 1.5;
}

.status-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  
  @media (min-width: 480px) {
    flex-direction: row;
    justify-content: center;
  }
}

.auth-button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: $radius;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 120px;
  
  &.primary {
    background: $brand;
    color: white;
    
    &:hover {
      background: color.adjust($brand, $lightness: -10%);
      transform: translateY(-1px);
    }
  }
  
  &.secondary {
    background: transparent;
    color: $brand;
    border: 2px solid $brand;
    
    &:hover {
      background: rgba($brand, 0.1);
      transform: translateY(-1px);
    }
  }
  
  &:active {
    transform: translateY(0);
  }
}

// Mobile responsiveness
@media (max-width: 768px) {
  .auth-page {
    margin: 1rem auto;
    padding: 0 0.75rem;
  }
  
  .status-card {
    padding: 1.5rem;
  }
  
  .status-icon i {
    font-size: 2.5rem;
  }
  
  .status-card h3 {
    font-size: 1.2rem;
  }
  
  .auth-button {
    padding: 0.625rem 1.25rem;
    font-size: 0.9rem;
  }
}
</style>
