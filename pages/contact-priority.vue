<template>
  <section class="page-container contact-priority-page">
    <header class="page-header">
      <div class="page-title">
        <h1>Contact & Priority</h1>
      </div>
    </header>

    <!-- WhatsApp Numbers Section -->
    <div class="content-section">
      <div class="section-header">
        <h2>WhatsApp Numbers</h2>
        <AppButton
          label="Add Number"
          color="primary"
          margin="left"
          :showPlusIcon="true"
          @click="openAddPhoneNumber"
        />
      </div>

      <div v-if="phoneNumbers.length === 0" class="empty-state">
        <AppIcon name="phone" size="xl" class="empty-icon" />
        <h3>No WhatsApp numbers configured</h3>
        <p>Add a WhatsApp number to start receiving contacts</p>
      </div>

      <div v-else class="phone-numbers-grid">
        <div
          v-for="phone in phoneNumbers"
          :key="phone.id"
          class="phone-card"
          :class="{ 'verified': phone.isVerified, 'unverified': !phone.isVerified }"
        >
          <div class="phone-header">
            <div class="phone-info">
              <h3 class="phone-name">{{ phone.name || 'Unnamed Number' }}</h3>
              <p class="phone-number">{{ phone.number }}</p>
            </div>
            <div class="phone-status">
              <span
                v-if="phone.isVerified"
                class="status-badge verified"
              >
                <AppIcon name="check" size="sm" />
                Verified
              </span>
              <span v-else class="status-badge unverified">
                <AppIcon name="time" size="sm" />
                Unverified
              </span>
              <span
                v-if="!isPhoneNumberAssigned(phone.id)"
                class="status-badge non-assigned"
              >
                <AppIcon name="info" size="sm" />
                Non Assigned
              </span>
            </div>
          </div>

          <div class="phone-actions">
            <AppButton
              v-if="!phone.isVerified"
              label="Confirm Number"
              color="warning"
              size="sm"
              @click="confirmPhoneNumber(phone)"
            />
            <AppButton
              label="Edit"
              color="secondary"
              size="sm"
              @click="editPhoneNumber(phone)"
            />
            <AppButton
              color="error"
              margin="left"
              faIconLeft="trash"
              size="sm"
              @click="deletePhoneNumber(phone)"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Contact Configuration Section -->
    <div class="content-section">
      <div class="section-header">
        <div class="section-title-with-info">
          <h2>Client Priority Configuration</h2>
          <FieldTooltip
            text="Client priority is assigned via your configured webhook. Guest users are assigned lowest priority by default."
            class="config-info-icon"
          >
             <i class="fas fa-info-circle"></i>
          </FieldTooltip>
        </div>
        <p class="section-description">Configure contact settings and limits for different client priorities</p>
      </div>

      <div class="config-grid">
        <div
          v-for="config in sortedContactConfigs"
          :key="config.id"
          class="config-card"
        >
          <div class="config-header">
            <h3 class="priority-title">
              {{ formatPriority(config.clientPriority) }} Priority {{ getPriorityEmoji(config.clientPriority) }}
            </h3>
            <div class="config-actions">
              <AppButton
                label="Edit"
                color="secondary"
                size="sm"
                @click="editContactConfig(config)"
              />
            </div>
          </div>

          <div class="config-details">
            <div class="config-row">
              <span class="config-label">WhatsApp Number:</span>
              <span class="config-value">
                <span v-if="config.phoneNumber && phoneNumbers.find(p => p.id === config.phoneNumber)" class="phone-number-set">
                  {{ phoneNumbers.find(p => p.id === config.phoneNumber)?.number }}
                </span>
                <span v-else class="phone-not-set">Not set</span>
                <span v-if="config.phoneNumber && phoneNumbers.find(p => p.id === config.phoneNumber) && !phoneNumbers.find(p => p.id === config.phoneNumber)?.isVerified" class="unverified-note">
                  (Unverified)
                </span>
              </span>
            </div>
            <div class="config-row">
              <span class="config-label">Client AI Type:</span>
              <span class="config-value">
                <span class="ai-type-badge" :class="config.clientFacingAiType || 'fast'">
                  {{ formatAiType(config.clientFacingAiType || 'fast') }}
                </span>
              </span>
            </div>
            <div class="config-row">
              <span class="config-label">Staff AI Type:</span>
              <span class="config-value">
                <span class="ai-type-badge" :class="config.staffFacingAiType || 'fast'">
                  {{ formatAiType(config.staffFacingAiType || 'fast') }}
                </span>
              </span>
            </div>
            <div class="config-row">
              <span class="config-label">Documentation Updates:</span>
              <span class="config-value">
                <AppIcon :name="config.contactForDocumentationUpdate ? 'check' : 'close'" size="sm" />
                {{ config.contactForDocumentationUpdate ? 'Enabled' : 'Disabled' }}
              </span>
            </div>
            <div class="config-row">
              <span class="config-label">Issue Contacts:</span>
              <span class="config-value">
                <AppIcon :name="config.contactForIssues ? 'check' : 'close'" size="sm" />
                {{ config.contactForIssues ? 'Enabled' : 'Disabled' }}
              </span>
            </div>
                        <div class="config-row">
                          <span class="config-label">Tokens Today:</span>
                          <span class="config-value">
                            <span :class="{ exceeded: (config.tokenCountToday ?? 0) > ((config.MaxMessagesPerDayGlobal || 0) * 18000) }">
                              {{ formatK(config.tokenCountToday ?? 0) }}
                            </span>
                            <span v-if="config.MaxMessagesPerDayGlobal" class="max-note">
                              / {{ formatK(config.MaxMessagesPerDayGlobal * 18000) }}
                            </span>
                          </span>
                        </div>
                        <div class="config-row">
                          <span class="config-label">Tokens This Week:</span>
                          <span class="config-value">
                            <span :class="{ exceeded: (config.tokenCountThisWeek ?? 0) > ((config.MaxMessagesPerWeekGlobal || 0) * 18000) }">
                              {{ formatK(config.tokenCountThisWeek ?? 0) }}
                            </span>
                            <span v-if="config.MaxMessagesPerWeekGlobal" class="max-note">
                              / {{ formatK(config.MaxMessagesPerWeekGlobal * 18000) }}
                            </span>
                          </span>
                        </div>
                        <div class="config-row">
                          <span class="config-label">Messages Today:</span>
                          <span class="config-value">
                            <span :class="{ exceeded: (config.messageCountToday ?? 0) > (config.MaxMessagesPerDayGlobal || 0) }">
                              {{ formatNumber(config.messageCountToday ?? 0) }}
                            </span>
                            <span v-if="config.MaxMessagesPerDayGlobal" class="max-note">
                              / {{ formatNumber(config.MaxMessagesPerDayGlobal) }}
                            </span>
                          </span>
                        </div>
                        <div class="config-row">
                          <span class="config-label">Messages This Week:</span>
                          <span class="config-value">
                            <span :class="{ exceeded: (config.messageCountThisWeek ?? 0) > (config.MaxMessagesPerWeekGlobal || 0) }">
                              {{ formatNumber(config.messageCountThisWeek ?? 0) }}
                            </span>
                            <span v-if="config.MaxMessagesPerWeekGlobal" class="max-note">
                              / {{ formatNumber(config.MaxMessagesPerWeekGlobal) }}
                            </span>
                          </span>
                        </div>
          </div>

          <div class="limits-grid">
            <div class="limit-item">
              <span class="limit-label">
                Daily Global
                <FieldTooltip
                  :text="configFieldOverrides.MaxMessagesPerDayGlobal?.description || ''"
                  class="limit-info-icon"
                >
                  <i class="fas fa-info-circle"></i>
                </FieldTooltip>
              </span>
              <span class="limit-value">{{ config.MaxMessagesPerDayGlobal }}</span>
            </div>
            <div class="limit-item">
              <span class="limit-label">
                Weekly Global
                <FieldTooltip
                  :text="configFieldOverrides.MaxMessagesPerWeekGlobal?.description || ''"
                  class="limit-info-icon"
                >
                  <i class="fas fa-info-circle"></i>
                </FieldTooltip>
              </span>
              <span class="limit-value">{{ config.MaxMessagesPerWeekGlobal }}</span>
            </div>
            <div class="limit-item">
              <span class="limit-label">
                Daily Per User
                <FieldTooltip
                  :text="configFieldOverrides.MaxMessagesPerDayPerUser?.description || ''"
                  class="limit-info-icon"
                >
                  <i class="fas fa-info-circle"></i>
                </FieldTooltip>
              </span>
              <span class="limit-value">{{ config.MaxMessagesPerDayPerUser }}</span>
            </div>
            <div class="limit-item">
              <span class="limit-label">
                Weekly Per User
                <FieldTooltip
                  :text="configFieldOverrides.MaxMessagesPerWeekPerUser?.description || ''"
                  class="limit-info-icon"
                >
                  <i class="fas fa-info-circle"></i>
                </FieldTooltip>
              </span>
              <span class="limit-value">{{ config.MaxMessagesPerWeekPerUser }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit WhatsApp Number Popup -->
    <AppPopup
      :show="showPhonePopup"
      :title="editingPhone ? 'Edit WhatsApp Number' : 'Add WhatsApp Number'"
      size="lg"
      @close="closePhonePopup"
    >
      <MegaForm
        v-if="showPhonePopup"
        :formClass="PhoneNumber"
        v-model="phoneFormData"
        :fieldOverrides="phoneFieldOverrides"
        :includeFields="!editingPhone ? ['name', 'number'] :['name']"
        :actions="phoneFormActions"
      />
    </AppPopup>

    <!-- Edit Contact Config Popup -->
    <AppPopup
      :show="showConfigPopup"
      :title="editingConfig ? `Edit ${formatPriority(editingConfig.clientPriority)} Priority Configuration ${getPriorityEmoji(editingConfig.clientPriority)}` : 'Edit Configuration'"
      size="lg"
      @close="closeConfigPopup"
    >
      <MegaForm
        v-if="showConfigPopup && editingConfig"
        :formClass="ContactConfig"
        v-model="configFormData"
        :fieldOverrides="configFieldOverrides"
        :includeFields="[
          'phoneNumber',
          'contactForDocumentationUpdate',
          'contactForIssues',
          'MaxMessagesPerWeekGlobal',
          'MaxMessagesPerDayGlobal',
          'MaxMessagesPerWeekPerUser',
          'MaxMessagesPerDayPerUser',
          'clientFacingAiType',
          'staffFacingAiType',
          'maxHistoryPages'
        ]"
        :actions="configFormActions"
      />
    </AppPopup>

    <!-- Delete Confirmation Popup -->
    <AppPopup
      :show="showDeleteConfirmation"
      title="Delete WhatsApp Number"
      size="sm"
      @close="closeDeleteConfirmation"
    >
      <div class="delete-confirmation">
        <p>Are you sure you want to delete this WhatsApp number?</p>
        <div class="delete-item">
          <strong>{{ deletingPhone?.name || 'Unnamed Number' }}</strong>
          <br>
          <span class="phone-detail">{{ deletingPhone?.number }}</span>
        </div>
        <p class="delete-warning">This action cannot be undone.</p>
      </div>
      <template #footer>
        <div class="delete-footer">
          <AppButton label="Cancel" color="secondary" @click="closeDeleteConfirmation" />
          <AppButton margin="left" label="Delete" color="error" @click="confirmDeletePhone" />
        </div>
      </template>
    </AppPopup>

    <!-- WhatsApp Number Verification Popup -->
    <AppPopup
      :show="showVerificationPopup"
      title="Verify WhatsApp Number"
      size="md"
      @close="closeVerificationPopup"
    >
      <div class="verification-content">
        <div class="verification-instructions">
          <div class="instruction-header">
            <AppIcon name="info" size="lg" class="instruction-icon" />
            <h3>Instructions</h3>
          </div>
          <p>Make sure a WhatsApp account is configured for this number before proceeding.</p>
          <div class="phone-info">
            <strong>{{ verifyingPhone?.name || 'Unnamed Number' }}</strong>
            <br>
            <span class="phone-number">{{ verifyingPhone?.number }}</span>
          </div>
        </div>
        
        <MegaForm
          v-if="showVerificationPopup"
          :formClass="VerifyCodeDto"
          v-model="verificationFormData"
          :includeFields="['code']"
          :actions="verificationFormActions"
        />
      </div>
    </AppPopup>
  </section>
</template>

<script setup lang="ts">
import AppButton from '~/components/AppButton.vue'
import AppIcon from '~/components/AppIcon.vue'
import AppPopup from '~/components/AppPopup.vue'
import FieldTooltip from '~/components/FieldTooltip.vue'
import MegaForm, { type MegaFormAction, type OverrideRecord } from '~/components/MegaForm.vue'
import { PhoneNumber } from '~/eicrud_exports/services/WHATSAPP-ms/phone-number/phone-number.entity'
import { ContactConfig } from '~/eicrud_exports/services/WHATSAPP-ms/contact-config/contact-config.entity'
import { VerifyCodeDto } from '~/eicrud_exports/services/WHATSAPP-ms/phone-number/cmds/verify_code/verify_code.dto'
import { SendVerifyDto } from '~/eicrud_exports/services/WHATSAPP-ms/phone-number/cmds/send_verify/send_verify.dto'
import { ClientPriority } from '~/eicrud_exports/services/SUPPORT-ms/client/client.entity'
import { getPriorityEmoji, formatPriority } from '~/utils/priority'

const phoneNumbers = ref<PhoneNumber[]>([])

const contactConfigs = ref<ContactConfig[]>([])

// Fetch phone numbers from API
const fetchPhoneNumbers = async () => {
  try {
    const nuxtApp = useNuxtApp()
    const result = await nuxtApp.$sp.phoneNumber.find({
      product: nuxtApp.$userProductId as string,
    })
    phoneNumbers.value = Array.isArray(result) ? result : (result?.data || [])
  } catch (error) {
    console.error('Failed to fetch phone numbers:', error)
    useNuxtApp().$toast.show('Failed to load phone numbers', 'error')
    phoneNumbers.value = []
  }
}

// Fetch contact configurations from API
const fetchContactConfigs = async () => {
  try {
    const nuxtApp = useNuxtApp()
    const result = await nuxtApp.$sp.contactConfig.find({
        product: nuxtApp.$userProductId as string,
    })
    contactConfigs.value = result.data || []
  } catch (error) {
    console.error('Failed to fetch contact configurations:', error)
    // Keep empty array on error
    contactConfigs.value = []
  }
}

// Fetch data on component mount
onMounted(() => {
  fetchPhoneNumbers()
  fetchContactConfigs()
})

// Computed property to check which phone numbers are not assigned to any config
const isPhoneNumberAssigned = (phoneId: string): boolean => {
  return contactConfigs.value.some(config => config.phoneNumber === phoneId)
}

// Computed property to sort configs by priority (lowest first)
const sortedContactConfigs = computed(() => {
  const priorityOrder: Record<ClientPriority, number> = {
    [ClientPriority.LOWEST]: 1,
    [ClientPriority.REGULAR]: 2,
    [ClientPriority.HIGH]: 3
  }
  
  return [...contactConfigs.value].sort((a, b) => {
    return priorityOrder[a.clientPriority] - priorityOrder[b.clientPriority]
  })
})

// Phone number management
const showPhonePopup = ref(false)
const editingPhone = ref<PhoneNumber | null>(null)
const phoneFormData = ref({})

// Contact config management
const showConfigPopup = ref(false)
const editingConfig = ref<ContactConfig | null>(null)
const configFormData = ref({})

// Delete confirmation
const showDeleteConfirmation = ref(false)
const deletingPhone = ref<PhoneNumber | null>(null)

// Phone verification
const showVerificationPopup = ref(false)
const verifyingPhone = ref<PhoneNumber | null>(null)
const verificationFormData = ref({})

// Helper functions
const formatAiType = (aiType: string): string => {
  switch (aiType) {
    case 'fast':
      return 'Fast'
    case 'smart':
      return 'Smart (2.5x cost)'
    default:
      return 'Fast'
  }
}

// Simple number formatter for readability
const formatNumber = (n: number): string => {
  try {
    return Number(n || 0).toLocaleString()
  } catch {
    return String(n)
  }
}

// Format numbers in K units (e.g., 1.2K). Below 1000 show full number.
const formatK = (n: number): string => {
  const v = Number(n || 0)
  if (isNaN(v)) return '0'
  if (Math.abs(v) < 1000) return v.toLocaleString()
  const k = v / 1000
  const s = k.toFixed(1)
  return `${s.endsWith('.0') ? s.slice(0, -2) : s}K`
}

// Phone number functions
const openAddPhoneNumber = () => {
  editingPhone.value = null
  phoneFormData.value = {
    isVerified: false
  }
  showPhonePopup.value = true
}

const editPhoneNumber = (phone: PhoneNumber) => {
  editingPhone.value = phone
  phoneFormData.value = { ...phone }
  showPhonePopup.value = true
}

const closePhonePopup = () => {
  showPhonePopup.value = false
  editingPhone.value = null
  phoneFormData.value = {}
}

const confirmPhoneNumber = (phone: PhoneNumber) => {
  verifyingPhone.value = phone
  verificationFormData.value = {
    code: '',
    numberId: phone.id,
    productId: useNuxtApp().$userProductId as string
  }
  showVerificationPopup.value = true
}

const closeVerificationPopup = () => {
  showVerificationPopup.value = false
  verifyingPhone.value = null
  verificationFormData.value = {}
}

const deletePhoneNumber = (phone: PhoneNumber) => {
  deletingPhone.value = phone
  showDeleteConfirmation.value = true
}

const closeDeleteConfirmation = () => {
  showDeleteConfirmation.value = false
  deletingPhone.value = null
}

const confirmDeletePhone = async () => {
  if (!deletingPhone.value) return
  
  try {
    const nuxtApp = useNuxtApp()
    
    await nuxtApp.$sp.phoneNumber.delete({ id: deletingPhone.value.id, product: nuxtApp.$userProductId as string })
    
    
    
    nuxtApp.$toast.show('Phone number deleted successfully', 'success')
    await fetchPhoneNumbers();
    await fetchContactConfigs();
    closeDeleteConfirmation()
  } catch (error) {
    console.error('Failed to delete phone number:', error)
    useNuxtApp().$toast.show(error, 'error')
  }
}

// Contact config functions
const editContactConfig = (config: ContactConfig) => {
  editingConfig.value = config
  // Convert phoneNumber object to ID for the form
  const formData: any = { ...config }
  if (config.phoneNumber && typeof config.phoneNumber === 'object') {
    formData.phoneNumber = config.phoneNumber.id
  }
  configFormData.value = formData
  showConfigPopup.value = true
}

const closeConfigPopup = () => {
  showConfigPopup.value = false
  editingConfig.value = null
  configFormData.value = {}
}

// Form configurations
const phoneFieldOverrides: OverrideRecord = {
  number: {
    label: 'WhatsApp Number',
    placeholder: '+1234567890',
    type: 'tel'
  },
  name: {
    label: 'Display Name',
    placeholder: 'e.g., Primary Support Line'
  },
  isVerified: {
    label: 'Verified',
    description: 'Whether this WhatsApp number has been verified'
  }
}

const phoneFormActions = computed<MegaFormAction[]>(() => [
  {
    label: 'Cancel',
    color: 'secondary',
    callback: async () => {
      closePhonePopup()
    }
  },
  {
    label: editingPhone.value ? 'Update Number' : 'Add Number',
    color: 'primary',
    margin: 'left',
    callback: async (formData: any) => {
      try {
        const nuxtApp = useNuxtApp()
        
        if (editingPhone.value) {
          // Update existing phone number
          await nuxtApp.$sp.phoneNumber.patchOne(
            { id: editingPhone.value.id, product: nuxtApp.$userProductId as string },
            formData
          )
    
          
          nuxtApp.$toast.show('Phone number updated successfully', 'success');
          await fetchPhoneNumbers();
        } else {
          // Create new phone number
          const newPhoneData: Partial<PhoneNumber> = {
            ...formData,
            product: nuxtApp.$userProductId as string,
            isVerified: undefined
          }
          
          const createdPhone = await nuxtApp.$sp.phoneNumber.create(newPhoneData)
          phoneNumbers.value.push(createdPhone)
          
          nuxtApp.$toast.show('Phone number added successfully', 'success')
        }
        
        closePhonePopup()
      } catch (error) {
        console.error('Failed to save phone number:', error)
        useNuxtApp().$toast.show(error, 'error')
      }
    }
  }
])

const verificationFormActions: MegaFormAction[] = [
  {
    label: 'Cancel',
    color: 'secondary',
    
    callback: async () => {
      closeVerificationPopup()
    }
  },
  {
    label: 'Send WhatsApp Code',
    color: 'warning',
    margin: 'no-margins',
    skipValidation: true,
    callback: async () => {
      try {
        if (!verifyingPhone.value) return
        
        const nuxtApp = useNuxtApp()
        await nuxtApp.$sp.phoneNumber.send_verify({
          number: verifyingPhone.value.number,
          productId: nuxtApp.$userProductId as string
        })
        
        nuxtApp.$toast.show('Verification code sent to WhatsApp number', 'success')
      } catch (error) {
        console.error('Failed to send verification code:', error)
        useNuxtApp().$toast.show(error, 'error')
      }
    }
  },
  {
    label: 'Confirm Number',
    color: 'primary',
    margin: 'left',
    callback: async (formData: VerifyCodeDto) => {
      try {
        if (!verifyingPhone.value) return
        
        const nuxtApp = useNuxtApp()
        await nuxtApp.$sp.phoneNumber.verify_code({
          code: formData.code,
          numberId: verifyingPhone.value.id,
          productId: nuxtApp.$userProductId as string
        })
        
        // Mark as verified in local state and refresh data
        if (verifyingPhone.value) {
          verifyingPhone.value.isVerified = true
          
          // Update the phone number in the list
          const index = phoneNumbers.value.findIndex(p => p.id === verifyingPhone.value!.id)
          if (index !== -1 && phoneNumbers.value[index]) {
            phoneNumbers.value[index].isVerified = true
          }
          
          // Auto-assign this verified number to contact configs without a phone number
          const configsWithoutPhone = contactConfigs.value.filter(config => !config.phoneNumber)
          if (configsWithoutPhone.length > 0 && verifyingPhone.value) {
            for (const config of configsWithoutPhone) {
              try {
                await nuxtApp.$sp.contactConfig.patchOne({
                  id: config.id,
                  product: nuxtApp.$userProductId as string
                }, {
                  phoneNumber: verifyingPhone.value.id
                })
              } catch (error) {
                console.error('Failed to auto-assign phone number to config:', error)
              }
            }
            
            // Refresh contact configs to show the updated assignments
            await fetchContactConfigs()
          }
        }
        
        nuxtApp.$toast.show('WhatsApp number verified successfully!', 'success')
        closeVerificationPopup()
      } catch (error) {
        console.error('Verification failed:', error)
        useNuxtApp().$toast.show(error, 'error')
      }
    }
  }
]

// Computed field overrides to provide dynamic phone number options
const configFieldOverrides = computed<OverrideRecord>(() => {
  // Get verified phone numbers for the dropdown
  const verifiedPhoneOptions = phoneNumbers.value
    .filter(phone => phone.isVerified)
    .map(phone => ({
      label: `${phone.name || 'Unnamed'} (${phone.number})`,
      value: phone.id
    }))

  return {

    phoneNumber: {
      label: 'Associated WhatsApp Number',
      description: 'WhatsApp number to use for this priority level (must be verified)',
      selectOptions: verifiedPhoneOptions.length > 0 ? verifiedPhoneOptions : [
        { label: 'No verified WhatsApp numbers available', value: null }
      ]
    },
    clientFacingAiType: {
      label: 'Client-Facing AI Model',
      description: 'AI reasoning level for customer chat interactions (smart costs 2x more)',
      selectOptions: [
        { label: 'Fast - Standard reasoning', value: 'fast' },
        { label: 'Smart - High reasoning (2.5x cost)', value: 'smart' }
      ]
    },
    staffFacingAiType: {
      label: 'Staff-Facing AI Model', 
      description: 'AI reasoning level for WhatsApp communication with staff (smart costs 2x more)',
      selectOptions: [
        { label: 'Fast - Standard reasoning', value: 'fast' },
        { label: 'Smart - High reasoning (2.5x cost)', value: 'smart' }
      ]
    },
    maxHistoryPages: {
      label: 'Max History Pages',
      type: 'number',
      description: 'Maximum number of chat history pages the AI retain before summarizing it. Increase if you have custom tools that return large amounts of data.'
    },
    contactForDocumentationUpdate: {
      label: 'Documentation Update Notifications',
      description: 'AI will send messages to ask for documentation updates'
    },
    contactForIssues: {
      label: 'Issue Contact Notifications',
      description: 'AI will send messages to ask for support assistance'
    },
    MaxMessagesPerDayGlobal: {
      label: 'Max Messages Per Day (Global)',
      type: 'number',
      description: 'Maximum total messages per day across all users of this priority'
    },
    MaxMessagesPerWeekGlobal: {
      label: 'Max Messages Per Week (Global)',
      type: 'number',
      description: 'Maximum total messages per week across all users of this priority'
    },
    MaxMessagesPerDayPerUser: {
      label: 'Max Messages Per Day (Per User)',
      type: 'number',
      description: 'Maximum messages per day for individual users of this priority'
    },
    MaxMessagesPerWeekPerUser: {
      label: 'Max Messages Per Week (Per User)',
      type: 'number',
      description: 'Maximum messages per week for individual users of this priority'
    }
  }
})

const configFormActions: MegaFormAction[] = [
  {
    label: 'Cancel',
    color: 'secondary',
    skipValidation: true,
    callback: async () => {
      closeConfigPopup()
    }
  },
  {
    label: 'Save Configuration',
    color: 'primary',
    margin: 'left',
    callback: async (formData: any) => {
      try {
        if (!editingConfig.value) return
        
        const nuxtApp = useNuxtApp()
        
        // Update the contact config via API
        await nuxtApp.$sp.contactConfig.patch({
          id: editingConfig.value.id,
          product: nuxtApp.$userProductId as string

        }, formData)
        
        // Re-fetch the data to get the latest state
        await fetchContactConfigs()
        
        nuxtApp.$toast.show('Configuration saved successfully', 'success')
        closeConfigPopup()
      } catch (error) {
        console.error('Failed to save configuration:', error)
        useNuxtApp().$toast.show(error, 'error')
      }
    }
  }
]
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
}

.content-section {
  background: $panel;
  border-radius: $radius;
  box-shadow: $shadow;
  padding: 2rem;
  margin-bottom: 2rem;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  
  .section-title-with-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    
    h2 {
      width: max-content;
      margin: 0;
      color: $text;
      font-size: 1.5rem;
    }
    
    .config-info-icon {
      color: $muted;
      cursor: help;
      opacity: 0.7;
      transition: opacity 0.2s ease;
      
      &:hover {
        opacity: 1;
      }
    }
  }
  
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

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: $muted;
  
  .empty-icon {
    opacity: 0.5;
    margin-bottom: 1rem;
  }
  
  h3 {
    margin: 0 0 0.5rem 0;
    color: $text;
  }
  
  p {
    margin: 0;
  }
}

.phone-numbers-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  
  // Desktop: Better space utilization with flex
  @media (min-width: 1200px) {
    gap: 2rem;
  }
}

.phone-card {
  background: $bg;
  border: 2px solid $muted;
  border-radius: $radius;
  padding: 1.5rem;
  transition: all 0.3s ease;
  flex: 1;
  min-width: 350px;
  max-width: 500px;
  
  &.verified {
    border-color: $brand;
    
    .phone-header {
      border-bottom-color: rgba($brand, 0.2);
    }
  }
  
  &.unverified {
    border-color: $warning;
    
    .phone-header {
      border-bottom-color: rgba($warning, 0.2);
    }
  }
}

.phone-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-bottom: 1rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid rgba($muted, 0.3);
}

.phone-info {
  flex: 1;
  
  .phone-name {
    margin: 0 0 0.25rem 0;
    color: $text;
    font-size: 1.1rem;
  }
  
  .phone-number {
    margin: 0;
    color: $muted;
    font-family: monospace;
    font-size: 0.9rem;
  }
}

.phone-status {
  display: flex;
  gap: 0.375rem;
  
  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.25rem 0.75rem;
    border-radius: $radius;
    font-size: 0.8rem;
    font-weight: 600;
    
    &.verified {
      background: rgba($brand, 0.1);
      color: $brand;
    }
    
    &.unverified {
      background: rgba($warning, 0.1);
      color: $warning;
    }
    
    &.non-assigned {
      background: rgba($muted, 0.1);
      color: $muted;
    }
  }
}

.phone-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.config-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
}

.config-card {
  background: $bg;
  border: 1px solid $muted;
  border-radius: $radius;
  padding: 1.5rem;
}

.config-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  
  .priority-title {
    margin: 0;
    color: $text;
    font-size: 1.2rem;
  }
}

.config-details {
  margin-bottom: 1.5rem;
}

.config-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba($muted, 0.2);
  
  &:last-child {
    border-bottom: none;
  }
  
  .config-label {
    font-weight: 500;
    color: $text;
  }
  
  .config-value {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: $muted;
    
    .max-note {
      opacity: 0.8;
    }
    
    .exceeded {
      color: $warning;
      font-weight: 600;
    }
    
    .unverified-note {
      color: $warning;
      font-size: 0.8rem;
    }
    
    .phone-not-set {
      color: $warning;
      font-style: italic;
    }
    
    .ai-type-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: $radius;
      font-size: 0.8rem;
      font-weight: 600;
      
      &.fast {
        background: rgba($brand, 0.1);
        color: $brand;
      }
      
      &.smart {
        background: rgba($ok, 0.1);
        color: $ok;
      }
    }
  }
}

.limits-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  background: rgba($muted, 0.05);
  padding: 1rem;
  border-radius: $radius;
}

.limit-item {
  text-align: center;
  
  .limit-label {
    display: block;
    font-size: 0.8rem;
    color: $muted;
    margin-bottom: 0.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    
    .limit-info-icon {
      i {
        opacity: 0.4;
        font-size: 0.7rem;
        cursor: help;
        
        &:hover {
          opacity: 0.8;
        }
      }
    }
  }
  
  .limit-value {
    display: block;
    font-size: 1.2rem;
    font-weight: 600;
    color: $text;
  }
}

.delete-confirmation {
  text-align: center;
  padding: 1rem;
}

.delete-item {
  margin: 1rem 0;
  padding: 1rem;
  background: $bg;
  border-radius: $radius;
  
  .phone-detail {
    color: $muted;
    font-family: monospace;
  }
}

.delete-warning {
  color: $warning;
  font-size: 0.9rem;
  margin-top: 1rem;
}

.delete-footer {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.verification-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.verification-instructions {
  background: rgba($brand, 0.05);
  border: 1px solid rgba($brand, 0.1);
  border-radius: $radius;
  padding: 1.5rem;
}

.instruction-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  
  .instruction-icon {
    color: $brand;
  }
  
  h3 {
    margin: 0;
    color: $text;
    font-size: 1.1rem;
  }
}

.phone-info {
  margin-top: 1rem;
  padding: 1rem;
  background: rgba($text, 0.05);
  border-radius: $radius;
  border-left: 3px solid $brand;
  
  strong {
    color: $text;
    font-size: 1rem;
  }
  
  .phone-number {
    color: $text-muted;
    font-family: 'Courier New', monospace;
    font-size: 0.9rem;
  }
}

// Mobile responsive
@media (max-width: 768px) {
  .content-section {
    padding: 1rem;
  }
  
  .section-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .phone-numbers-grid {
    display: grid;
    grid-template-columns: 1fr;
    justify-items: center;
    max-width: 400px;
    margin: 0 auto;
    
    .phone-card {
      flex: none;
      min-width: auto;
      max-width: 100%;
      width: 100%;
    }
  }
  
  .config-grid {
    grid-template-columns: 1fr;
    justify-items: center;
    max-width: 450px;
    margin: 0 auto;
  }
  
  .phone-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .phone-actions {
    justify-content: center;
  }
  
  .limits-grid {
    grid-template-columns: 1fr;
  }
}
</style>
