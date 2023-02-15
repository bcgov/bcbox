<script setup lang="ts">
import Button from 'primevue/button';
import { ref, onMounted, Ref } from 'vue';
import BucketsTable from './BucketsTable.vue';
import { BucketConfig as BucketConfigConst } from '@/utils/constants';
import BucketConfigDialog from '@/components/bucket/BucketConfigDialog.vue';
import BucketsSidebar from './BucketsSidebar.vue';
import { useBucketStore } from '@/store';
import { useToaster } from '@/composables/useToaster';
import type { Bucket } from '@/interfaces';

const bucketStore = useBucketStore();

const displayInfo: any = ref(null);

const displayBucketConfig: Ref<boolean> = ref(false);
const bucketConfigHeader: Ref<string> = ref('');
const bucketConfigTitle: Ref<string> = ref('');
const isBucketConfigUpdate: Ref<boolean> = ref(false);
const bucketToUpdate: Ref<Bucket> = ref({} as Bucket);

const showInfo = async (bucketId: any) => {
  displayInfo.value = await bucketStore.getBucketInfo(bucketId);
};

const closeInfo = () => {
  displayInfo.value = null;
};

const showBucketConfig = (isUpdate: boolean, bucket: Bucket) => {
  if(isUpdate) {
    bucketConfigHeader.value = BucketConfigConst.headerNewBucket;
    bucketConfigTitle.value = bucket.bucketName;
  } else {
    bucketConfigHeader.value = BucketConfigConst.headerNewBucket;
    bucketConfigTitle.value = BucketConfigConst.titleNewBucket;
  }
  isBucketConfigUpdate.value = isUpdate;
  bucketToUpdate.value = bucket;
  displayBucketConfig.value = true;
};

const closeBucketConfig = () => {
  displayBucketConfig.value = false;
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
    <div>
      <Button
        label="Primary"
        class="p-button-outlined mt-4"
        @click="showBucketConfig(false, {} as Bucket)"
      >
        <font-awesome-icon icon="fa-solid fa-plus" />
        Configure new bucket
      </Button>
      <BucketConfigDialog
        v-if="displayBucketConfig"
        :is-update="isBucketConfigUpdate"
        :bucket="bucketToUpdate"
        :display="displayBucketConfig"
        :header="bucketConfigHeader"
        :title="bucketConfigTitle"
        @close-bucket-config="closeBucketConfig"
      />
    </div>
    <div class="flex mt-7">
      <div class="flex-grow-1">
        <BucketsTable
          @show-info="showInfo"
          @show-bucket-config="showBucketConfig"
        />
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

button {
  float: right;
  text-indent: 10px;
}
</style>
