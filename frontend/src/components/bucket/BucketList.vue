<script setup lang="ts">
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import { ref, onMounted } from 'vue';

import { BucketConfigForm, BucketsSidebar, BucketsTable } from '@/components/bucket';
import { useToaster } from '@/composables/useToaster';
import { useBucketStore } from '@/store';
import { BucketConfig } from '@/utils/constants';

import type { Ref } from 'vue';
import type { Bucket } from '@/interfaces';
import { storeToRefs } from 'pinia';

// Store
const bucketStore = useBucketStore();
const { currentUser } = storeToRefs(useUserStore());

// State
const displayInfo: Ref<Bucket | undefined> = ref(undefined);

const displayBucketConfig: Ref<boolean> = ref(false);
const bucketConfigTitle: Ref<string> = ref(BucketConfig.TITLE_NEW_BUCKET);
const bucketToUpdate: Ref<Bucket | undefined> = ref(undefined);

// Actions
const showInfo = async (bucketId: any) => {
  displayInfo.value = bucketStore.getBucketById(bucketId);
};

const closeInfo = () => {
  displayInfo.value = undefined;
};

const showBucketConfig = (bucket?: Bucket) => {
  bucketConfigTitle.value = bucket?.bucketName || BucketConfig.TITLE_NEW_BUCKET;
  bucketToUpdate.value = bucket;
  displayBucketConfig.value = true;
};

const closeBucketConfig = () => {
  displayBucketConfig.value = false;
};

const load = async () => {
  await bucketStore.fetchBuckets({ userId: currentUser.value?.userId, objectPerms: true });
};

onMounted(() => {
  load();
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
        class="bcbox-info-dialog"
        :visible="displayBucketConfig"
        :style="{ width: '50vw' }"
        :modal="true"
        @update:visible="closeBucketConfig"
      >
        <template #header>
          <font-awesome-icon
            icon="fas fa-cog"
            fixed-width
          />
          <span class="p-dialog-title">{{ BucketConfig.HEADER_NEW_BUCKET }}</span>
        </template>
        
        <h3 class="bcbox-info-dialog-subhead">
          {{ bucketConfigTitle }}
        </h3>
             
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
