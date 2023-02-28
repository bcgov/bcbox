<script setup lang="ts">
import { storeToRefs } from 'pinia';
import Button from 'primevue/button';
import { useRouter } from 'vue-router';

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
