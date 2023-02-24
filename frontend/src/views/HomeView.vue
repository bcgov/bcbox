<script setup lang="ts">
import { useAuthStore } from '@/store';

const { getIsAuthenticated } = useAuthStore();
</script>

<template>
  <div>
    <h3 v-if="!getIsAuthenticated">
      Please login to continue.
    </h3>
    <h3 v-else>
      Welcome to BCBox.
    </h3>
  </div>
</template>

<style lang="scss" scoped>
h1 {
  font-weight: bold;
}

h3 {
  font-weight: bold;
}
</style>
