<script setup lang="ts">
// State
import { useAuthStore, useConfigStore, useUserStore } from '@/store';

const configStore = useConfigStore();
const authStore = useAuthStore();
const userStore = useUserStore();

// Get the config on setup of the main app view
await configStore.load();
// Set up keycloak
await authStore.init();
// Set up user store
await userStore.init();
</script>

<template>
  <div />
</template>
