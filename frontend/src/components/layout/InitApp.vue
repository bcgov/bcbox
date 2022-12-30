<script setup lang="ts">
// State
import { useAuthStore } from '@/store/authStore';
import { useConfigStore } from '@/store/configStore';
const configStore = useConfigStore();
const authStore = useAuthStore();

// Get the config on setup of the main app view
await configStore.load();
// Set up keycloak
await authStore.init();
</script>

<template>
  <div/>
</template>
