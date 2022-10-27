<script setup lang="ts">
import { useAuthStore } from '@/store/authStore';
const authStore = useAuthStore();
</script>

<template>
  <main>
    <p v-if="!authStore.isLoggedIn">Please login to continue.</p>
  </main>
</template>
