<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/store';

const { getIsAuthenticated } = storeToRefs(useAuthStore());
</script>

<template>
  <h3 v-if="!getIsAuthenticated">
    Please login to continue.
  </h3>
  <h3 v-else>
    Welcome to BCBox.
  </h3>
  <img src="@/assets/images/bcboxy.png">
</template>

<style lang="scss" scoped>
h1 {
  font-weight: bold;
}

h3 {
  font-weight: bold;
}
</style>
