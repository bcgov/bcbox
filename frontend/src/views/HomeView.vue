<script setup lang="ts">
import { storeToRefs } from 'pinia';
import BucketList from '@/components/bucket/BucketList.vue';
import { useAuthStore } from '@/store/authStore';
const { getAuthenticated } = storeToRefs(useAuthStore());
</script>

<template>
  <div>
    <h3 v-if="!getAuthenticated">Please login to continue.</h3>
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
