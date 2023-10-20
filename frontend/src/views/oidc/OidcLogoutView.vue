<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

import { Spinner } from '@/components/layout';
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
  <h1>Logging out...</h1>
  <Spinner />
</template>

<style lang="scss" scoped>
h1 {
  margin-top: 10rem;
  text-align: center;
}
.p-progress-spinner {
  display: flex;
  margin-top: 4rem;
  position: relative;
}
</style>
