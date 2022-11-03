<script setup lang="ts">
import Button from 'primevue/button';
import { useUserStore } from '@/store/userStore';

const userStore = useUserStore();

const removeBucket = async (bucket: Object) => {
  const response = await userStore.removeBucket(bucket);
};
</script>

<template>
  <div v-for="item in userStore.buckets" :key="item.bucketId">
    <Button class="p-button-sm" label="Remove" @click="removeBucket(item)" /> {{ item }}
  </div>
</template>

<style lang="scss" scoped>
div {
  padding-bottom: 10px;
}
</style>
