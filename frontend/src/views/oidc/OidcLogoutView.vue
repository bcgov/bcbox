<script setup lang="ts">
import ProgressSpinner from 'primevue/progressspinner';
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

import { useAuthStore } from '@/store';

const authStore = useAuthStore();
const router = useRouter();

onMounted(async () => {
  if (authStore.getIsAuthenticated) await authStore.logout();

  // Return user back to home page
  router.replace('/');
});
</script>

<template>
  <h2>Logging out...</h2>
  <ProgressSpinner />
</template>

<style lang="scss" scoped>
h2 {
  margin-top: 10rem;
  text-align: center;
}
.p-progress-spinner {
  display: flex;
  margin-top: 4rem;
  position: relative;
}
</style>
