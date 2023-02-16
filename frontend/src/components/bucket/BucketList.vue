<script setup lang="ts">
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import { ref, onMounted, Ref } from 'vue';

import { BucketConfig as BucketConfigConst } from '@/utils/constants';
import BucketConfigForm from '@/components/bucket/BucketConfigForm.vue';
import BucketsSidebar from '@/components/bucket/BucketsSidebar.vue';
import BucketsTable from '@/components/bucket/BucketsTable.vue';
import { useBucketStore } from '@/store';
import { useToaster } from '@/composables/useToaster';
import type { Bucket } from '@/interfaces';

const bucketStore = useBucketStore();

const displayInfo: any = ref(null);

const displayBucketConfig: Ref<boolean> = ref(false);
const bucketConfigHeader: Ref<string> = ref('');
const bucketConfigTitle: Ref<string> = ref('');
const bucketToUpdate: Ref<Bucket | undefined> = ref(undefined);

const showInfo = async (bucketId: any) => {
  displayInfo.value = await bucketStore.getBucketInfo(bucketId);
};

const closeInfo = () => {
  displayInfo.value = null;
};

const showBucketConfig = (bucket?: Bucket) => {
  bucketConfigHeader.value = BucketConfigConst.headerNewBucket;
  bucketConfigTitle.value = bucket ? bucket.bucketName : BucketConfigConst.titleNewBucket;
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
        @click="showBucketConfig()"
      >
        <font-awesome-icon icon="fa-solid fa-plus" />
        Configure new bucket
      </Button>
      <Dialog
        :visible="displayBucketConfig"
        :style="{width: '50vw'}"
        :modal="true"
        @update:visible="closeBucketConfig"
      >
        <template #header>
          <div class="flex">
            <font-awesome-icon
              icon="fas fa-cog"
              class="pr-3 pt-2"
              style="font-size: 2rem"
            />
            <div>
              <h1>{{ bucketConfigHeader }}</h1>
              <h3>{{ bucketConfigTitle }}</h3>
            </div>
          </div>
        </template>
        <BucketConfigForm
          :bucket="bucketToUpdate"
          @submit-bucket-config="closeBucketConfig"
          @cancel-bucket-config="closeBucketConfig"
        />
      </Dialog>
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
