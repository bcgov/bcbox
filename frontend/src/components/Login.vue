<script setup lang="ts">
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import Button from 'primevue/button';
import { useAuthStore } from '@/store/authStore';

const authStore = useAuthStore();
const { isLoggedIn, ready, getToken } = storeToRefs(useAuthStore());

const login = () => {
  authStore.login();
};

const logout = async () => {
  const response = await authStore.logout();
};
</script>

<template>
  <Button v-if="!getToken" primary @click="login" :loading="!ready">Login</Button>
  <Button v-else primary @click="logout">Logout</Button>
</template>
