<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import MyBucketsTable from '../components/MyBucketsTable.vue';
import MyBucketsSidebar from '../components/MyBucketsSidebar.vue';
import { useBucketStore } from '@/store/bucketStore';

const bucketStore = useBucketStore();
const toast = useToast();

const displayInfo: any = ref(null);

const loadBuckets = async () => {
  try {
    await bucketStore.load();
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Unable to load buckets.', detail: error, life: 5000 });
  }
};

const showInfo = async (bucketId: any) => {
  displayInfo.value = await bucketStore.getBucketInfo(bucketId);
};

const closeInfo = () => {
  displayInfo.value = null;
};

onMounted(() => {
  loadBuckets();
});
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
</template>

<style lang="scss" scoped>
h1 {
  font-weight: bold;
}

h3 {
  font-weight: bold;
}
</style>
