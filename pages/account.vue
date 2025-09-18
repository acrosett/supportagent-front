<template>
  <section class="page-container account-page">
    <header class="page-header">
      <div class="page-title">
        <h1>Account Settings</h1>
        <p class="page-description">Manage your account, email, password, and security settings.</p>
      </div>
    </header>

    <!-- Account Deletion Warning (if flagged) -->
    <div v-if="product?.flaggedForDeletion" class="content-section deletion-warning">
      <div class="warning-header">
        <AppIcon name="info" size="lg" class="warning-icon" />
        <div class="warning-content">
          <h2>Account Scheduled for Deletion</h2>
          <p>Your account has been flagged for deletion on <strong>{{ formatDeletionDate(product.flaggedForDeletion) }}</strong></p>
          <p class="deletion-countdown">{{ getDeletionCountdown(product.flaggedForDeletion) }}</p>
        </div>
      </div>
    </div>

    <!-- Email Verification Section -->
    <div class="content-section">
      <div class="section-header">
        <h2>Email Verification</h2>
        <p class="section-description">Verify your email address to enable additional security features</p>
      </div>
      
      <div class="email-status-container">
        <div class="current-email">
          <label class="current-label">Email Address:</label>
          <span class="current-value">{{ userEmail || 'Loading...' }}</span>
           <AppButton
              label="Update Email"
              color="secondary"
              size="sm"
              margin="left"
            />
        </div>

        <div class="verification-status">
          <div v-if="emailVerified" class="status-verified">
            <AppIcon name="check" size="md" class="status-icon" />
            <span class="status-text">Email Verified</span>
          </div>
          <div v-else class="status-unverified">
            <AppIcon name="info" size="md" class="status-icon" />
            <span class="status-text">Email Not Verified</span>
            <AppButton
              label="Send Verification Email"
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
        <h2>Two-Factor Authentication (2FA)</h2>
        <p class="section-description">Add an extra layer of security to your account</p>
      </div>

      <div class="twofa-container">
        <div class="twofa-status">
          <div class="twofa-info">
            <h3>{{ twoFactorEnabled ? 'Two-Factor Authentication Enabled' : 'Two-Factor Authentication Disabled' }}</h3>
            <p v-if="!emailVerified" class="twofa-requirement">
              Please verify your email address first to enable 2FA
            </p>
            <p v-else-if="!twoFactorEnabled" class="twofa-description">
              Enable 2FA to secure your account with an additional authentication step
            </p>
            <p v-else class="twofa-description">
              Your account is protected with two-factor authentication
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
        <h2>Change Password</h2>
        <p class="section-description">Update your account password</p>
      </div>

      <MegaForm
        :formClass="ChangePasswordFormDto"
        v-model="passwordFormData"
        :includeFields="['currentPassword', 'newPassword', 'confirmPassword']"
        :fieldOverrides="passwordFieldOverrides"
        :actions="passwordFormActions"
      />
    </div>

    <!-- Delete Account Section -->
    <div class="content-section danger-section">
      <div class="section-header">
        <h2>Delete Account</h2>
        <p class="section-description">Permanently delete your account and all associated data</p>
      </div>

      <div class="danger-content">
        <div class="danger-warning">
          <AppIcon name="info" size="md" class="danger-icon" />
          <div class="danger-text">
            <h3>This action cannot be undone</h3>
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

        <div class="danger-actions">
          <AppButton
            v-if="!product?.flaggedForDeletion"
            label="Delete Account"
            color="error"
            @click="handleDeleteAccount"
          />
          <AppButton
            v-else
            label="Cancel Account Deletion"
            color="secondary"
            @click="handleCancelDeletion"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Product } from '~/eicrud_exports/services/SUPPORT-ms/product/product.entity'
import { ChangePasswordDto as ApiChangePasswordDto } from '~/eicrud_exports/services/user/cmds/change_password/change_password.dto'
import MegaForm, { type MegaFormAction, type OverrideRecord } from '~/components/MegaForm.vue'
import AppButton from '~/components/AppButton.vue'
import AppIcon from '~/components/AppIcon.vue'
import ToggleSwitch from '~/components/ToggleSwitch.vue'

// Define DTOs for form handling
class ChangePasswordFormDto {
  currentPassword: string = ''
  newPassword: string = ''
  confirmPassword: string = ''
}

// Reactive data
const product = ref<Product | null>(null)
const userEmail = ref<string>('')
const passwordFormData = ref<ChangePasswordFormDto>(new ChangePasswordFormDto())

// Email verification state
const emailVerified = ref<boolean>(false)
const isLoadingVerification = ref<boolean>(false)

// Two-factor authentication state
const twoFactorEnabled = ref<boolean>(false)
const isLoadingTwoFactor = ref<boolean>(false)

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
    return '1 day remaining'
  } else {
    return `${daysLeft} days remaining`
  }
}

// Form configurations
const passwordFieldOverrides: OverrideRecord = {
  currentPassword: {
    label: 'Current Password',
    type: 'password',
    placeholder: 'Enter your current password'
  },
  newPassword: {
    label: 'New Password',
    type: 'password',
    placeholder: 'Enter your new password',
    description: 'Must be at least 8 characters long'
  },
  confirmPassword: {
    label: 'Confirm New Password',
    type: 'password',
    placeholder: 'Confirm your new password'
  }
}

// Email verification functions
const sendVerificationEmail = async () => {
  try {
    isLoadingVerification.value = true
    const nuxtApp = useNuxtApp()
    
    // TODO: Implement send verification email API call
    // await nuxtApp.$sp.user.send_verification_email({})
    
    // For now, just show a placeholder message
    nuxtApp.$toast.show('Verification email functionality coming soon', 'info')
  } catch (error) {
    console.error('Failed to send verification email:', error)
    useNuxtApp().$toast.show('Failed to send verification email', 'error')
  } finally {
    isLoadingVerification.value = false
  }
}

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
    label: 'Update Password',
    color: 'primary',
    callback: async (formData: ChangePasswordFormDto) => {
      try {
        if (formData.newPassword !== formData.confirmPassword) {
          throw new Error('Passwords do not match')
        }
        
        const nuxtApp = useNuxtApp()
        
        // Use the correct API method with proper field mapping
        const changePasswordData = {
          oldPassword: formData.currentPassword,
          newPassword: formData.newPassword,
          logMeIn: false
        } as ApiChangePasswordDto
        
        await nuxtApp.$sp.user.change_password(changePasswordData)
        
        nuxtApp.$toast.show('Password updated successfully', 'success')
        passwordFormData.value = new ChangePasswordFormDto()
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
    
    // TODO: Implement flag for deletion API call
    await nuxtApp.$sp.product.patch(
      { id: nuxtApp.$userProductId },
      { flaggedForDeletion: new Date() }
    )
    
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
    
    // TODO: Implement cancel deletion API call
    await nuxtApp.$sp.product.patch(
      { id: nuxtApp.$userProductId },
      { flaggedForDeletion: null }
    )
    
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
