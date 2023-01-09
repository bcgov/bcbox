<script setup lang="ts">
import { ref, onMounted } from 'vue';
import BucketsTable from './BucketsTable.vue';
import BucketsSidebar from './BucketsSidebar.vue';
import { useBucketStore } from '@/store';
import { useToaster } from '@/composables/useToaster';

const bucketStore = useBucketStore();

const displayInfo: any = ref(null);

const showInfo = async (bucketId: any) => {
  displayInfo.value = await bucketStore.getBucketInfo(bucketId);
};

const closeInfo = () => {
  displayInfo.value = null;
};

onMounted(() => {
  useToaster(bucketStore.load, { summary: 'Unable to load buckets.' });
});
</script>

<template>
  <div>
    <div>
      <h1>Select a bucket</h1>
      <h3>Buckets are containers for storing objects.</h3>
    </div>
    <div class="flex mt-7">
      <div class="flex-grow-1">
        <BucketsTable @show-info="showInfo" />
      </div>
      <div
        v-if="displayInfo"
        class="flex-shrink-0 ml-3"
        style="max-width: 33%; min-width: 33%"
      >
        <BucketsSidebar
          :display-info="displayInfo"
          @close-info="closeInfo"
        />
      </div>
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
