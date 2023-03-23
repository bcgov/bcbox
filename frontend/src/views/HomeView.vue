<script setup lang="ts">
import { Message } from '@/lib/primevue';
import { storeToRefs } from 'pinia';

import { useAuthStore, useConfigStore } from '@/store';

// Store
const { getIsAuthenticated } = storeToRefs(useAuthStore());
const { getConfig } = storeToRefs(useConfigStore());
</script>

<template>
  <Message
    v-if="getConfig?.notificationBanner"
    severity="warn"
  >
    {{ getConfig?.notificationBanner }}
  </Message>

  <h3 v-if="!getIsAuthenticated">
    Please log in to continue.
  </h3>
  <h3 v-else>
    Welcome to BCBox.
  </h3>
</template>

<style lang="scss" scoped>
h1 {
  font-weight: bold;
}
</style>
