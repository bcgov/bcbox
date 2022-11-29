<script setup lang="ts">
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import Button from 'primevue/button';
import { useAuthStore } from '@/store/authStore';

const authStore = useAuthStore();
const { ready, getKeycloak } = storeToRefs(useAuthStore());

const login = () => {
  authStore.login();
};

const logout = () => {
  authStore.logout();
};
</script>

<template>
  <Button v-if="!getKeycloak.token" primary @click="login" :loading="!ready">Log in</Button>
  <Button v-else primary @click="logout">Log out</Button>
</template>
