<template>
  <section class="page-container account-page">
    <header class="page-header">
      <div class="page-title">
        <h1>{{ t('page.title') }}</h1>
        <p class="page-description">{{ t('page.description') }}</p>
      </div>
    </header>

    <!-- Account Deletion Warning (if flagged) -->
    <div v-if="product?.flaggedForDeletion" class="content-section deletion-warning">
      <div class="warning-header">
        <AppIcon name="info" size="lg" class="warning-icon" />
        <div class="warning-content">
          <h2>{{ t('deletion.title') }}</h2>
          <p>{{ t('deletion.scheduledMessage', { date: formatDeletionDate(product.flaggedForDeletion) }) }}</p>
          <p class="deletion-countdown">{{ getDeletionCountdown(product.flaggedForDeletion) }}</p>
        </div>
      </div>
    </div>

    <!-- Email Verification Section -->
    <div class="content-section">
      <div class="section-header">
        <h2>{{ t('email.title') }}</h2>
        <p class="section-description">{{ t('email.description') }}</p>
      </div>
      
      <div class="email-status-container">
        <div class="current-email">
          <label class="current-label">{{ t('email.emailAddress') }}:</label>
          <span class="current-value">{{ userEmail || t('common.loading') }}</span>
           <AppButton
              :label="t('email.updateEmail')"
              color="secondary"
              size="sm"
              margin="left"
              @click="openEmailChangePopup"
            />
        </div>

        <div class="verification-status">
          <div v-if="emailVerified" class="status-verified">
            <AppIcon name="check" size="md" class="status-icon" />
            <span class="status-text">{{ t('email.verified') }}</span>
          </div>
          <div v-else class="status-unverified">
            <AppIcon name="info" size="md" class="status-icon" />
            <span class="status-text">{{ t('email.notVerified') }}</span>
            <AppButton
              :label="t('email.sendVerification')"
              color="primary"
              size="sm"
              margin="left"
              @click="sendVerificationEmail"
              :disabled="isLoadingVerification"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Two-Factor Authentication Section -->
    <div class="content-section">
      <div class="section-header">
        <h2>{{ t('twoFA.title') }}</h2>
        <p class="section-description">{{ t('twoFA.description') }}</p>
      </div>

      <div class="twofa-container">
        <div class="twofa-status">
          <div class="twofa-info">
            <h3>{{ twoFactorEnabled ? t('twoFA.enabled') : t('twoFA.disabled') }}</h3>
            <p v-if="!emailVerified" class="twofa-requirement">
              {{ t('twoFA.requirement') }}
            </p>
            <p v-else-if="!twoFactorEnabled" class="twofa-description">
              {{ t('twoFA.enableDescription') }}
            </p>
            <p v-else class="twofa-description">
              {{ t('twoFA.protectedMessage') }}
            </p>
          </div>
          
          <div class="twofa-toggle">
            <ToggleSwitch
              v-model="twoFactorEnabled"
              :disabled="!emailVerified || isLoadingTwoFactor"
              onLabel="ON"
              offLabel="OFF"
              label="Enable 2FA"
              labelPosition="left"
              @update:modelValue="handleTwoFactorToggle"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Change Password Section -->
    <div class="content-section">
      <div class="section-header">
        <h2>{{ t('password.title') }}</h2>
        <p class="section-description">Update your account password</p>
      </div>

      <MegaForm
        :formClass="ChangePasswordDto"
        v-model="passwordFormData"
        :includeFields="['oldPassword', 'newPassword']"
        :fieldOverrides="passwordFieldOverrides"
        :actions="passwordFormActions"
      />
    </div>

    <!-- Delete Account Section -->
    <div class="content-section" :class="{ 'danger-section': product?.flaggedForDeletion }">
      <div class="section-header">
        <h2>{{ t('deleteAccount.title') }}</h2>
        <p class="section-description">Permanently delete your account and all associated data</p>
      </div>

      <div class="danger-content">
        <!-- Account deletion process info (only when not flagged) -->
        <div v-if="!product?.flaggedForDeletion" class="info-warning">
          <AppIcon name="info" size="md" class="info-icon" />
          <div class="info-text">
            <h3>Account Deletion Process</h3>
            <p>Deleting your account will permanently remove all your data, including:</p>
            <ul>
              <li>All chat conversations and messages</li>
              <li>Custom tools and configurations</li>
              <li>Account settings and preferences</li>
              <li>Billing history and subscription data</li>
            </ul>
            <p><strong>Your account will be deleted 30 days after confirmation.</strong></p>
          </div>
        </div>

        <!-- Deletion countdown message (only when flagged) -->
        <div v-if="product?.flaggedForDeletion" class="deletion-countdown-message">
          <AppIcon name="info" size="md" class="countdown-icon" />
          <span>Your account will be deleted in {{ getDeletionCountdown(product.flaggedForDeletion).toLowerCase() }}</span>
        </div>

        <div class="danger-actions">
          <AppButton
            v-if="!product?.flaggedForDeletion"
            :label="t('deleteAccount.deleteButton')"
            color="error"
            @click="handleDeleteAccount"
          />
          <AppButton
            v-else
            :label="t('deleteAccount.cancelButton')"
            color="ok"
            @click="handleCancelDeletion"
          />
        </div>
      </div>
    </div>

    <!-- Email Change Popup -->
    <AppPopup 
      :show="showEmailChangePopup"
      :title="t('email.popup.title')"
      @close="closeEmailChangePopup"
    >
      <div class="popup-description">
        <p>{{ t('email.popup.description') }}</p>
      </div>
      
      <MegaForm
        :formClass="SendVerificationEmailDto"
        v-model="emailChangeFormData"
        :fieldOverrides="emailChangeFieldOverrides"
        :actions="emailChangeActions"
      />
    </AppPopup>
  </section>
</template>

<script setup lang="ts">
import { Product } from '~/eicrud_exports/services/SUPPORT-ms/product/product.entity'
import { User } from '~/eicrud_exports/services/user/user.entity'
import { ChangePasswordDto } from '~/eicrud_exports/services/user/cmds/change_password/change_password.dto'
import { SendVerificationEmailDto } from '~/eicrud_exports/services/user/cmds/send_verification_email/send_verification_email.dto'
import { DeleteAccountDto } from '~/eicrud_exports/services/user/cmds/delete_account/delete_account.dto'
import MegaForm, { type MegaFormAction, type OverrideRecord } from '~/components/MegaForm.vue'
import AppButton from '~/components/AppButton.vue'
import AppIcon from '~/components/AppIcon.vue'
import AppPopup from '~/components/AppPopup.vue'
import ToggleSwitch from '~/components/ToggleSwitch.vue'
import { useLocalNamespace } from '~/composables/useLocalNamespace'

const { t } = useLocalNamespace('account')

// Reactive data
const product = ref<Product | null>(null)
const user = ref<User | null>(null)
const userEmail = ref<string>('')
const passwordFormData = ref<ChangePasswordDto>({
  oldPassword: '',
  newPassword: '',
  logMeIn: false
} as ChangePasswordDto)

// Email verification state
const isLoadingVerification = ref<boolean>(false)

// Two-factor authentication state
const twoFactorEnabled = ref<boolean>(false)
const isLoadingTwoFactor = ref<boolean>(false)

// Email change popup state
const showEmailChangePopup = ref<boolean>(false)
const emailChangeFormData = ref<SendVerificationEmailDto>({
  newEmail: '',
  password: ''
})

// Computed properties
const emailVerified = computed(() => {
  return user.value?.isEmailVerified || user.value?.emailVerified || user.value?.isVerified || false
})

// Load product data
const fetchProduct = async () => {
  try {
    const nuxtApp = useNuxtApp()
    if (!nuxtApp.$userProductId) {
      throw new Error('No user product ID available')
    }
    
    const result = await nuxtApp.$sp.product.findOne({ 
      id: nuxtApp.$userProductId 
    })
    
    product.value = result
    userEmail.value = nuxtApp.$userEmail || ''
    
    // Fetch user data to get email verification status
    if (nuxtApp.$userId) {
      const userData = await nuxtApp.$sp.user.findOne({ 
        id: nuxtApp.$userId 
      })
      console.log('Fetched user data:', userData)
      user.value = userData
      
      // Update email verification status from user data
      // Try common field names for email verification
      if (userData) {
        user.value = userData
      }
    }
  } catch (error) {
    console.error('Failed to fetch product:', error)
    useNuxtApp().$toast.show('Failed to load account data', 'error')
  }
}

// Date formatting functions
const formatDeletionDate = (date: Date): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getDeletionCountdown = (flaggedDate: Date): string => {
  const deletionDate = new Date(flaggedDate)
  deletionDate.setDate(deletionDate.getDate() + 30) // Add 30 days
  
  const now = new Date()
  const diff = deletionDate.getTime() - now.getTime()
  const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24))
  
  if (daysLeft <= 0) {
    return 'Account deletion is overdue'
  } else if (daysLeft === 1) {
    return '1 day'
  } else {
    return `${daysLeft} days`
  }
}

// Form configurations
const passwordFieldOverrides: OverrideRecord = {
  oldPassword: {
    label: t('password.fields.current.label'),
    type: 'password',
    placeholder: t('password.fields.current.placeholder')
  },
  newPassword: {
    label: t('password.fields.new.label'),
    type: 'password',
    placeholder: t('password.fields.new.placeholder'),
    description: t('password.fields.new.description'),
    doubleCheck: true
  }
}

// Email verification functions
const sendVerificationEmail = async () => {
  try {
    isLoadingVerification.value = true
    const nuxtApp = useNuxtApp()
    
    // Call send_verification_email with empty optional fields for current email verification
    const verifyEmailData = new SendVerificationEmailDto()
    await nuxtApp.$sp.user.send_verification_emailS(verifyEmailData)
    
    nuxtApp.$toast.show('Verification email has been sent to your current email address', 'success')
  } catch (error) {
    console.error('Failed to send verification email:', error)
    useNuxtApp().$toast.show('Failed to send verification email', 'error')
  } finally {
    isLoadingVerification.value = false
  }
}

// Email change functions
const openEmailChangePopup = () => {
  // Reset form data
  emailChangeFormData.value = {
    newEmail: '',
    password: ''
  }
  showEmailChangePopup.value = true
}

const closeEmailChangePopup = () => {
  showEmailChangePopup.value = false
}

// Email change form configuration
const emailChangeFieldOverrides: OverrideRecord<SendVerificationEmailDto> = {
  newEmail: {
    type: 'email',
    doubleCheck: true,
    label: t('email.fields.newEmail.label'),
    placeholder: t('email.fields.newEmail.placeholder'),
    description: t('email.fields.newEmail.description')
  },
  password: {
    type: 'password',
    label: t('email.fields.password.label'),
    placeholder: t('email.fields.password.placeholder'),
    description: t('email.fields.password.description')
  }
}

const emailChangeActions: MegaFormAction[] = [
  {
    label: t('email.sendVerification'),
    color: 'primary',
    callback: async (data: SendVerificationEmailDto) => {
      try {
        const nuxtApp = useNuxtApp()
        
        await nuxtApp.$sp.user.send_verification_emailS(data)
        
        nuxtApp.$toast.show(
          'Verification email sent to your new email address. Please check your inbox and follow the instructions.',
          'success'
        )
        
        // Close popup and reset form
        closeEmailChangePopup()
        
      } catch (error) {
        console.error('Failed to send email change verification:', error)
        throw new Error('Failed to send verification email. Please check your password and try again.')
      }
    }
  }
]

// Two-factor authentication functions
const handleTwoFactorToggle = async (enabled: boolean) => {
  try {
    isLoadingTwoFactor.value = true
    const nuxtApp = useNuxtApp()
    
    // TODO: Implement 2FA toggle API call
    // await nuxtApp.$sp.user.toggle_two_factor({ enabled })
    
    // For now, just show a placeholder message
    if (enabled) {
      nuxtApp.$toast.show('2FA enable functionality coming soon', 'info')
      // Revert the toggle since we didn't actually enable it
      twoFactorEnabled.value = false
    } else {
      nuxtApp.$toast.show('2FA disable functionality coming soon', 'info')
      // Revert the toggle since we didn't actually disable it
      twoFactorEnabled.value = true
    }
  } catch (error) {
    console.error('Failed to toggle 2FA:', error)
    useNuxtApp().$toast.show('Failed to update 2FA settings', 'error')
    // Revert the toggle on error
    twoFactorEnabled.value = !enabled
  } finally {
    isLoadingTwoFactor.value = false
  }
}

// Form actions
const passwordFormActions: MegaFormAction[] = [
  {
    label: t('password.updateButton'),
    color: 'primary',
    callback: async (formData: ChangePasswordDto) => {
      try {
        const nuxtApp = useNuxtApp()
        
        // Set logMeIn to false for the API call
        const changePasswordData = {
          ...formData,
          logMeIn: true
        } as ChangePasswordDto
        
        await nuxtApp.$sp.user.change_passwordS(changePasswordData)
        
        nuxtApp.$toast.show('Password updated successfully', 'success')
        passwordFormData.value = {
          oldPassword: '',
          newPassword: '',
        } as ChangePasswordDto
      } catch (error) {
        console.error('Failed to change password:', error)
        useNuxtApp().$toast.show('Failed to update password', 'error')
        throw error
      }
    }
  }
]

// Account deletion functions
const handleDeleteAccount = async () => {
  try {
    const nuxtApp = useNuxtApp()
    
    const confirmed = await nuxtApp.$confirmPopup.show(
      'Are you sure you want to delete your account? This action cannot be undone and your account will be permanently deleted in 30 days.'
    )
    
    if (!confirmed) return
    
    // Use delete_account API call to flag for deletion
    await nuxtApp.$sp.user.delete_account({ delete: true } as DeleteAccountDto)
    
    // Refresh product data to show the warning
    await fetchProduct()
    
    nuxtApp.$toast.show('Account has been flagged for deletion in 30 days', 'warning')
  } catch (error) {
    console.error('Failed to delete account:', error)
    useNuxtApp().$toast.show('Failed to delete account', 'error')
  }
}

const handleCancelDeletion = async () => {
  try {
    const nuxtApp = useNuxtApp()
    
    const confirmed = await nuxtApp.$confirmPopup.show(
      'Are you sure you want to cancel the account deletion?'
    )
    
    if (!confirmed) return
    
    // Use delete_account API call to unflag for deletion
    await nuxtApp.$sp.user.delete_account({ delete: false } as DeleteAccountDto)
    
    // Refresh product data to hide the warning
    await fetchProduct()
    
    nuxtApp.$toast.show('Account deletion has been cancelled', 'success')
  } catch (error) {
    console.error('Failed to cancel deletion:', error)
    useNuxtApp().$toast.show('Failed to cancel deletion', 'error')
  }
}

// Load data on mount
onMounted(() => {
  fetchProduct()
})
</script>

<style scoped lang="scss">
@use "~/assets/_variables.scss" as *;

.page-header {
  margin-bottom: 2rem;
}

.page-title {
  h1 {
    margin: 0;
    color: $text;
    font-size: 2rem;
  }
  
  .page-description {
    margin: 0.5rem 0 0 0;
    color: $muted;
    font-size: 1rem;
  }
}

.content-section {
  background: $panel;
  border-radius: $radius;
  box-shadow: $shadow;
  padding: 2rem;
  margin-bottom: 2rem;
  
  &.danger-section {
    border: 2px solid rgba($error, 0.3);
    background: rgba($error, 0.02);
  }
  
  &.deletion-warning {
    border: 2px solid rgba($warning, 0.5);
    background: rgba($warning, 0.05);
  }
}

.section-header {
  margin-bottom: 1.5rem;
  
  h2 {
    margin: 0;
    color: $text;
    font-size: 1.5rem;
  }
  
  .section-description {
    color: $muted;
    margin: 0.25rem 0 0 0;
    font-size: 0.9rem;
  }
}

.warning-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  
  .warning-icon {
    color: $warning;
    flex-shrink: 0;
    margin-top: 0.25rem;
  }
  
  .warning-content {
    flex: 1;
    
    h2 {
      margin: 0 0 0.5rem 0;
      color: $warning;
      font-size: 1.3rem;
    }
    
    p {
      margin: 0 0 0.5rem 0;
      color: $text;
      
      &.deletion-countdown {
        font-weight: 600;
        color: $warning;
      }
    }
  }
}

.current-email {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba($brand, 0.05);
  border: 1px solid rgba($brand, 0.1);
  border-radius: $radius;
  margin-bottom: 1rem;
  
  .current-label {
    font-weight: 600;
    color: $text;
  }
  
  .current-value {
    color: $brand;
    font-size: 1rem;
    font-family: monospace;
    margin-top: 0.20rem;
  }
}

.email-status-container {
  display: flex;
  flex-direction: column;
}

.verification-status {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: $radius;
  
  .status-verified {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: $brand;
    font-weight: 600;
    
    .status-icon {
      color: $brand;
    }
  }
  
  .status-unverified {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: $warning;
    font-weight: 600;
    flex: 1;
    
    .status-icon {
      color: $warning;
    }
  }
}

.twofa-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.twofa-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: rgba($panel, 0.5);
  border: 1px solid rgba($muted, 0.2);
  border-radius: $radius;
  
  .twofa-info {
    flex: 1;
    
    h3 {
      margin: 0 0 0.5rem 0;
      color: $text;
      font-size: 1.1rem;
    }
    
    .twofa-requirement {
      color: $warning;
      font-size: 0.9rem;
      margin: 0;
      font-style: italic;
    }
    
    .twofa-description {
      color: $muted;
      font-size: 0.9rem;
      margin: 0;
      line-height: 1.4;
    }
  }
  
  .twofa-toggle {
    margin-left: 1rem;
  }
}

.danger-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.info-warning {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.5rem;
  background: rgba($muted, 0.05);
  border: 1px solid rgba($muted, 0.2);
  border-radius: $radius;
  
  .info-icon {
    color: $muted;
    flex-shrink: 0;
    margin-top: 0.25rem;
  }
  
  .info-text {
    flex: 1;
    
    h3 {
      margin: 0 0 0.5rem 0;
      color: $text;
      font-size: 1.1rem;
    }
    
    p {
      margin: 0 0 0.75rem 0;
      color: $text;
      line-height: 1.5;
      
      &:last-of-type {
        margin-bottom: 0;
        font-weight: 600;
      }
    }
    
    ul {
      margin: 0.75rem 0;
      padding-left: 1.5rem;
      color: $text;
      
      li {
        margin-bottom: 0.25rem;
        line-height: 1.4;
      }
    }
  }
}

.deletion-countdown-message {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: rgba($error, 0.1);
  border: 2px solid rgba($error, 0.3);
  border-radius: $radius;
  color: $error;
  font-weight: 600;
  font-size: 1rem;
  
  .countdown-icon {
    color: $error;
    flex-shrink: 0;
  }
}

.danger-warning {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.5rem;
  background: rgba($error, 0.05);
  border: 1px solid rgba($error, 0.2);
  border-radius: $radius;
  
  .danger-icon {
    color: $error;
    flex-shrink: 0;
    margin-top: 0.25rem;
  }
  
  .danger-text {
    flex: 1;
    
    h3 {
      margin: 0 0 0.5rem 0;
      color: $error;
      font-size: 1.1rem;
    }
    
    p {
      margin: 0 0 0.75rem 0;
      color: $text;
      line-height: 1.5;
      
      &:last-of-type {
        margin-bottom: 0;
        font-weight: 600;
      }
    }
    
    ul {
      margin: 0.75rem 0;
      padding-left: 1.5rem;
      color: $text;
      
      li {
        margin-bottom: 0.25rem;
        line-height: 1.4;
      }
    }
  }
}

.danger-actions {
  display: flex;
  justify-content: flex-start;
}

.popup-description {
  margin-bottom: 1.5rem;
  
  p {
    margin: 0;
    color: $muted;
    line-height: 1.5;
    font-size: 0.95rem;
  }
}

// Mobile responsive
@media (max-width: 768px) {
  .content-section {
    padding: 1rem;
  }
  
  .warning-header,
  .danger-warning {
    flex-direction: column;
    text-align: center;
    
    .warning-icon,
    .danger-icon {
      align-self: center;
    }
  }
  
  .current-email {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .verification-status {
    .status-unverified {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.75rem;
    }
  }
  
  .twofa-status {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
    text-align: center;
    
    .twofa-toggle {
      margin-left: 0;
      align-self: center;
    }
  }
}
</style>
