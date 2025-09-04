<template>
  <div class="auth-page">
    <h1>Register</h1>
    <p>Create a new account for your admin panel.</p>
    <MegaForm
      :formClass="CreateAccountDto"
      v-model="formData"
      :fieldOverrides="fieldOverrides"
      :excludeFields="['logMeIn', 'role', 'username']"
      :actions="actions"
    />
  </div>
</template>
<script setup lang="ts">
import MegaForm, { MegaFormAction } from '~/components/MegaForm.vue'
import { CreateAccountDto } from '~/eicrud_exports/services/user/cmds/create_account/create_account.dto'
import { ref } from 'vue'

definePageMeta({ layout: 'bare' })

const formData = ref({
  email: '',
  username: '',
  password: '',
  role: '',
  logMeIn: false
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
}

const actions: MegaFormAction[] = [
  {
    label: 'Register',
    color: 'primary',
    margin: 'right',
    callback: async (data: CreateAccountDto) => {
      // TODO: handle registration
      data.logMeIn = true;
      data.role = "user";

      const { userId, accessToken } = await useNuxtApp().$sp.user.create_accountS(data);
      await useNuxtApp().$sp.user.setJwt(accessToken as string);
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
    margin-bottom: 1rem;
  }
  
  p {
    text-align: center;
    color: $muted;
    margin-bottom: 2rem;
    font-size: 0.9rem;
  }
}
</style>
