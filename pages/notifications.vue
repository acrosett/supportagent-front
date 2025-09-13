<template>
  <div>
    <div class="header-row">
      <h1>Notifications</h1>
      <AppButton
        label="Configure Notification Preferences"
        color="primary"
        margin="left"
        @click="navigateToNotificationConfig"
      />
    </div>
    <p>Stay updated with alerts, messages, and important updates from your product and chatbot activities.</p>
  </div>
</template>

<script setup lang="ts">
import AppButton from '~/components/AppButton.vue'

function navigateToNotificationConfig() {
  navigateTo('/edit-notifications')
}
</script>

<style scoped>
.header-row {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}

.header-row h1 {
  margin: 0;
}
</style>
