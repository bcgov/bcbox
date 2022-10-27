<script setup lang="ts">
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import Button from 'primevue/button';
import { useAuthStore } from '@/store/authStore';

const authStore = useAuthStore();
const { isLoggedIn } = storeToRefs(useAuthStore());

const login = async () => {
  const response = await authStore.login();
};

const logout = async () => {
  const response = await authStore.logout();
};
</script>

<template>
  <Button v-if="!isLoggedIn" primary @click="login">Login</Button>
  <Button v-else primary @click="logout"><router-link :to="{ name: 'logout' }">Logout</router-link></Button>
</template>
