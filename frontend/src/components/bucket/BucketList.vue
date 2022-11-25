<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import BucketsTable from './BucketsTable.vue';
import BucketsSidebar from './BucketsSidebar.vue';
import { useBucketStore } from '@/store/bucketStore';

const bucketStore = useBucketStore();
const toast = useToast();

const displayInfo: any = ref(null);

const showInfo = async (bucketId: any) => {
  displayInfo.value = await bucketStore.getBucketInfo(bucketId);
};

const closeInfo = () => {
  displayInfo.value = null;
};

onMounted(async () => {
  try {
    await bucketStore.load();
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Unable to load buckets.', detail: error, life: 5000 });
  }
});
</script>

<template>
  <div>
    <h1>Select a bucket</h1>
    <h3>Buckets are containers for storing objects.</h3>
  </div>
  <div class="flex mt-7">
    <div class="flex-grow-1">
      <BucketsTable @show-info="showInfo" />
    </div>
    <div v-if="displayInfo" class="flex-shrink-0 ml-3" style="max-width: 33%; min-width: 33%">
      <BucketsSidebar :displayInfo="displayInfo" @close-info="closeInfo" />
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
