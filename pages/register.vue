<template>
  <div class="auth-page">
    <div class="auth-header">
      <div class="auth-logo">
        <i class="fas fa-robot"></i>
        <h1>DirectSupport.ai</h1>
      </div>
      <h2 class="auth-title">{{ t('page.title') }}</h2>
      <p class="auth-subtitle">{{ t('page.subtitle') }}</p>
    </div>
    <MegaForm
      :formClass="CreateAccountExtendedDto"
      v-model="formData"
      :fieldOverrides="fieldOverrides"
      :includeFields="['email', 'password', 'acceptedEula', 'acceptedMarketing']"
      :actions="actions"
    />
  </div>
</template>
<script setup lang="ts">
import MegaForm, { MegaFormAction } from '~/components/MegaForm.vue'
import { CreateAccountExtendedDto } from '~/eicrud_exports/services/user/cmds/create_account_extended/create_account_extended.dto'
import { ref } from 'vue'
import { useRecaptcha } from '~/composables/useRecaptcha'

definePageMeta({ layout: 'bare' })

// Add reCAPTCHA v3 script
useHead({
  script: [
    {
      src: 'https://www.google.com/recaptcha/api.js?render=6Ld0ANcrAAAAAB5t0TU3wifH5jwD29wSzyk3604H',
      async: true,
      defer: true
    }
  ]
})

// Composables
import { useLocalNamespace } from '~/composables/useLocalNamespace'
const { getRecaptchaToken } = useRecaptcha()
const { t } = useLocalNamespace('register')

const formData = ref({
  email: '',
  username: '',
  password: '',
  role: '',
  logMeIn: false,
  acceptedEula: false,
  acceptedMarketing: false
})

const fieldOverrides = {
  password: {
    type: 'password',
    label: t('form.fields.password.label'),
    doubleCheck: true
  },
  email: {
    type: 'email',
    label: t('form.fields.email.label')
  },
  acceptedEula: {
    type: 'checkbox',
    label: t('form.fields.acceptedEula.label')
  },
  acceptedMarketing: {
    type: 'checkbox',
    label: t('form.fields.acceptedMarketing.label')
  }
}

const actions: MegaFormAction[] = [
  {
    label: t('form.buttons.submit'),
    color: 'primary',
    margin: 'right',
    callback: async (data: CreateAccountExtendedDto) => {
      try {
        // Get reCAPTCHA token for account creation
        const recaptchaToken = await getRecaptchaToken('account_creation')
        if (!recaptchaToken) {
          useNuxtApp().$toast.show(t('messages.error.recaptchaFailed'), 'error')
          return
        }

        // Prepare registration data
        data.logMeIn = true;
        data.role = "product_owner";
        (data as any).recaptchaToken = recaptchaToken;

        const { userId, accessToken } = await useNuxtApp().$sp.user.create_account_extendedS(data);
        await useNuxtApp().$sp.user.setJwt(accessToken as string, 3600 * 30); // 30 minutes
        useNuxtApp().$userId = userId;
              
        // Navigate to /
        await useRouter().push('/');
      } catch (error) {
        useNuxtApp().$toast.show(error, 'error')
      }
    }
  },

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
