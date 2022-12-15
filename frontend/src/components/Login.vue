<script setup lang="ts">
import { storeToRefs } from 'pinia';
import Button from 'primevue/button';
import { useAuthStore } from '@/store/authStore';

const { login, logout } = useAuthStore();
const { ready, getKeycloak } = storeToRefs(useAuthStore());
</script>

<template>
  <Button v-if="!getKeycloak.token" primary @click="login" :loading="!ready">Log in</Button>
  <Button v-else primary @click="logout">Log out</Button>
</template>
