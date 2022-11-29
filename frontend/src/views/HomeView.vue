<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/store/authStore';

const { getAuthenticated } = storeToRefs(useAuthStore());
const { getKeycloak } = storeToRefs(useAuthStore());
</script>

<template>
  <div>
    <h3 v-if="!getKeycloak.authenticated">Please login to continue.</h3>
    <div v-else>
      <BucketList />
    </div>
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
