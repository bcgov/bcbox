<script setup lang="ts">
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import Button from 'primevue/button';
import { useAuthStore } from '@/store/authStore';

const authStore = useAuthStore();
const { ready, getToken } = storeToRefs(useAuthStore());

const login = () => {
  authStore.login();
};

const logout = async () => {
  const response = await authStore.logout();
};
</script>

<template>
  <Button v-if="!getToken" primary @click="login" :loading="!ready">Log in</Button>
  <Button v-else primary @click="logout">Log out</Button>
</template>
