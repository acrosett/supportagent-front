<template>
  <div class="auth-page">
    <div class="auth-header">
      <div class="auth-logo">
        <i class="fas fa-robot"></i>
        <h1>DirectSupport.ai</h1>
      </div>
      <h2 class="auth-title">Create Account</h2>
      <p class="auth-subtitle">Join us to start automating your customer support</p>
    </div>
    <MegaForm
      :formClass="CreateAccountExtendedDto"
      v-model="formData"
      :fieldOverrides="fieldOverrides"
      :excludeFields="['logMeIn', 'role', 'username']"
      :actions="actions"
    />
  </div>
</template>
<script setup lang="ts">
import MegaForm, { MegaFormAction } from '~/components/MegaForm.vue'
import { CreateAccountExtendedDto } from '~/eicrud_exports/services/user/cmds/create_account_extended/create_account_extended.dto'
import { ref } from 'vue'

definePageMeta({ layout: 'bare' })

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
    label: 'Password',
    doubleCheck: true
  },
  email: {
    type: 'email',
    label: 'Email'
  },
  acceptedEula: {
    type: 'checkbox',
    label: 'I accept the [End User License Agreement](https://directsupport.ai/eula)'
  },
  acceptedMarketing: {
    type: 'checkbox',
    label: 'I agree to receive marketing communications'
  }
}

const actions: MegaFormAction[] = [
  {
    label: 'Register',
    color: 'primary',
    margin: 'right',
    callback: async (data: CreateAccountExtendedDto) => {
      // TODO: handle registration
      data.logMeIn = true;
      data.role = "product_owner";

      const { userId, accessToken } = await useNuxtApp().$sp.user.create_account_extendedS(data);
      await useNuxtApp().$sp.user.setJwt(accessToken as string, 3600 * 30); // 30 minutes
      useNuxtApp().$userId = userId;
            
      // Navigate to /
      await useRouter().push('/');

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
