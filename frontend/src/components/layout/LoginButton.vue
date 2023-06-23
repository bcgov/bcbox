<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';

import { Button } from '@/lib/primevue';
import { useAuthStore } from '@/store/authStore';
import { RouteNames } from '@/utils/constants';

const router = useRouter();

const authStore = useAuthStore();
const { getIsAuthenticated } = storeToRefs(authStore);

function login() {
  router.push({ name: RouteNames.LOGIN });
}

function logout() {
  router.push({ name: RouteNames.LOGOUT });
}
</script>

<template>
  <Button
    v-if="!getIsAuthenticated"
    severity="secondary"
    outlined
    @click="login()"
  >
    Log in
  </Button>
  <Button
    v-else
    severity="secondary"
    outlined
    @click="logout()"
  >
    Log out
  </Button>
</template>

<style scoped>
button {
  color: white !important;
}
</style>
