<template>
  <div class="auth-page">
    <h1>Login</h1>
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
  
  h1 {
    text-align: center;
    color: $text;
    margin-bottom: 2rem;
  }
}
</style>
