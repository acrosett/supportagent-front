<template>
  <div class="auth-page">
    <div class="auth-header">
      <div class="auth-logo">
        <i class="fas fa-robot"></i>
        <h1>DirectSupport.ai</h1>
      </div>
      <h2 class="auth-title">Welcome Back</h2>
      <p class="auth-subtitle">Sign in to your account</p>
    </div>
    <MegaForm
      :formClass="LoginDto"
      v-model="formData"
      :fieldOverrides="fieldOverrides"
      :excludeFields="excludeFields"
        :links="links"
        :actions="actions"
    />
  </div>
</template>

<script setup lang="ts">
import MegaForm, { MegaFormAction, OverrideRecord } from '~/components/MegaForm.vue'
import { LoginDto } from '~/eicrud_exports/services/user/cmds/login/login.dto'
import { ref } from 'vue'

definePageMeta({ layout: 'bare' })

const links = [
  { label: 'No account? Register here', href: '/register' }
]

const formData = ref({
  email: '',
  password: ''
})

const fieldOverrides: OverrideRecord<LoginDto> = {

  password : {
    type: 'password',
  }
}

const excludeFields = ['twoFA_code', 'expiresInSec']


const actions: MegaFormAction[] = [
  {
    label: 'Login',
    color: 'primary',
    margin: 'right',
    callback: async (data: LoginDto) => {
      // TODO: handle registration
      const res = await useNuxtApp().$sp.user.login(data);
      if(!res){
        throw Error("Login failed");
      }
      const { userId, accessToken } = res;
      console.log("User ID:", userId);
      console.log("Access Token:", accessToken);
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
