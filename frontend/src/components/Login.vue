<script setup lang="ts">
import Button from 'primevue/button';

import { useAuthStore } from '@/store/authStore';

const { getIsAuthenticated, login, logout } = useAuthStore();
</script>

<template>
  <Button
    v-if="!getIsAuthenticated"
    primary
    @click="login()"
  >
    Log in
  </Button>
  <Button
    v-else
    primary
    @click="logout()"
  >
    Log out
  </Button>
</template>
