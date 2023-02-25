<script setup lang="ts">
import { storeToRefs } from 'pinia';
import Button from 'primevue/button';

import { useAuthStore } from '@/store/authStore';

const authStore = useAuthStore();
const { getIsAuthenticated } = storeToRefs(authStore);
</script>

<template>
  <Button
    v-if="!getIsAuthenticated"
    primary
    @click="authStore.login()"
  >
    Log in
  </Button>
  <Button
    v-else
    primary
    @click="authStore.logout()"
  >
    Log out
  </Button>
</template>
