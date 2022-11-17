<script setup lang="ts">
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import Button from 'primevue/button';
import MyBucketsTable from '../components/MyBucketsTable.vue';
import MyBucketsSidebar from '../components/MyBucketsSidebar.vue';

import { useBucketStore } from '@/store/bucketStore';

const bucketStore = useBucketStore();
const { buckets } = storeToRefs(useBucketStore());

const displayInfo: any = ref(null);

const loadBuckets = async () => {
  bucketStore.load();
};

const showInfo = async (bucketId: any) => {
  displayInfo.value = await bucketStore.getBucketInfo(bucketId);
};

const closeInfo = async () => {
  displayInfo.value = null;
};
</script>

<template>
  <div>
    <h1>Select a bucket</h1>
    <h3>Buckets are containers for storing objects.</h3>
  </div>
  <div class="flex mt-7">
    <div class="flex-grow-1">
      <MyBucketsTable @show-info="showInfo" />
    </div>
    <div v-if="displayInfo" class="flex-shrink-0 ml-3" style="max-width: 33%; min-width: 33%">
      <MyBucketsSidebar :displayInfo="displayInfo" @close-info="closeInfo" />
    </div>
  </div>
  <!-- TODO: For DEV purposes. Remove and load in buckets automatically eventually -->
  <div v-if="!buckets.length">
    <div class="flex justify-content-center">
      <Button class="p-button-sm" @click="loadBuckets">Load buckets</Button>
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
