<template>
  <div class="auth-page">
    <div class="auth-header">
      <div class="auth-logo">
        <i class="fas fa-robot"></i>
        <h1>DirectSupport.ai</h1>
      </div>
      <h2 class="auth-title">{{ $t(tokenId ? 'resetPassword.page.titleReset' : 'resetPassword.page.titleForgot') }}</h2>
      <p class="auth-subtitle">{{ $t(tokenId ? 'resetPassword.page.subtitleReset' : 'resetPassword.page.subtitleForgot') }}</p>
    </div>

    <!-- Send Reset Email Form (when no token_id) -->
    <MegaForm
      v-if="!tokenId"
      :formClass="SendPasswordResetEmailDto"
      v-model="sendResetFormData"
      :fieldOverrides="sendResetFieldOverrides"
      :links="resetPasswordLinks"
      :actions="sendResetActions"
    />

    <!-- Reset Password Form (when token_id present) -->
    <MegaForm
      v-else
      :formClass="ResetPasswordDto"
      v-model="resetPasswordFormData"
      :fieldOverrides="resetPasswordFieldOverrides"
      :excludeFields="resetPasswordExcludeFields"
      :links="resetPasswordLinks"
      :actions="resetPasswordActions"
    />
  </div>
</template>

<script setup lang="ts">
import MegaForm, { MegaFormAction, OverrideRecord } from '~/components/MegaForm.vue'
import { SendPasswordResetEmailDto } from '~/eicrud_exports/services/user/cmds/send_password_reset_email/send_password_reset_email.dto'
import { ResetPasswordDto } from '~/eicrud_exports/services/user/cmds/reset_password/reset_password.dto'
import { ref, computed, watch } from 'vue'

definePageMeta({ layout: 'bare' })

// Get token_id from URL query params
const route = useRoute()
const tokenId = computed(() => route.query.token_id as string || null)

// Remove computed page content as we're using i18n keys directly in template

// Send Reset Email Form Data & Configuration
const sendResetFormData = ref({
  email: ''
})

import { useLocalNamespaceAsync } from '~/composables/useLocalNamespace'
const { t } = await useLocalNamespaceAsync('reset-password')

const sendResetFieldOverrides: OverrideRecord<SendPasswordResetEmailDto> = {
  email: {
    type: 'email',
    placeholder: t('form.fields.email.placeholder'),
    description: t('form.fields.email.description')
  }
}


const sendResetActions: MegaFormAction[] = [
  {
    label: t('form.buttons.sendReset'),
    color: 'primary',
    margin: 'right',
    callback: async (data: SendPasswordResetEmailDto) => {
      try {
        await useNuxtApp().$sp.user.send_password_reset_emailS(data)
        
        useNuxtApp().$toast.show(
          t('messages.success.emailSent'), 
          'success'
        )
        
        // Reset form
        sendResetFormData.value.email = ''
        
        // Optional: redirect to login after a delay
        setTimeout(() => {
          useRouter().push('/login')
        }, 3000)
        
      } catch (error) {
        console.error('Failed to send reset email:', error)
        throw new Error(t('messages.error.sendFailed'))
      }
    }
  }
]

// Reset Password Form Data & Configuration
const resetPasswordFormData = ref({
  newPassword: '',
  logMeIn: true // Set to true as requested
})



const resetPasswordFieldOverrides: OverrideRecord<ResetPasswordDto> = {

  newPassword: {
    type: 'password',
    placeholder: t('form.fields.newPassword.placeholder'),
    description: t('form.fields.newPassword.description'),
    doubleCheck: true // Enable password confirmation
  },
    expiresInSec: {
    type: 'checkbox',
    label: t('form.fields.expiresInSec.label'),
    description: t('form.fields.expiresInSec.description'),
    mapValue: {
      true: 60*60*24*15,
      false: undefined
    }
  }
}

const resetPasswordExcludeFields = ['logMeIn', "token_id"] // Exclude as requested

const resetPasswordLinks = [
  { label: t('links.backToLogin'), href: '/login' }
]

const resetPasswordActions: MegaFormAction[] = [
  {
    label: t('form.buttons.resetPassword'),
    color: 'primary',
    margin: 'right',
    callback: async (data: ResetPasswordDto) => {
      try {
        // Ensure logMeIn is set to true and remove any excluded fields
        const resetData = {
          ...data,
          logMeIn: true,
          token_id: tokenId.value || '',
        }
        
        const res = await useNuxtApp().$sp.user.reset_passwordS(resetData)
        
        if (!res) {
          throw new Error(t('messages.error.resetFailed'))
        }
        
        const { userId, accessToken } = res
        
        // Set JWT with default expiration (30 minutes)
        const jwtExpiration = 3600 * 30
        useNuxtApp().$setIsConnectedCookie(jwtExpiration)
        useNuxtApp().$userId = userId
        
        useNuxtApp().$toast.show(
          t('messages.success.resetComplete'), 
          'success'
        )
        
        // Navigate to home page
        await useRouter().push('/')
        
      } catch (error) {
        console.error('Failed to reset password:', error)
        throw new Error(t('messages.error.invalidToken'))
      }
    }
  }
]
</script>

<style scoped lang="scss">
@use '~/assets/variables' as *;

.auth-page {
  max-width: 400px;
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
</style>
