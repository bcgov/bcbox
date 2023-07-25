<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { ref, onMounted } from 'vue';

import { BucketConfigForm, BucketSidebar, BucketTable } from '@/components/bucket';
import { Button, Dialog, Message } from '@/lib/primevue';
import { useAuthStore, useBucketStore, useConfigStore, usePermissionStore } from '@/store';
import { BucketConfig } from '@/utils/constants';

import type { Ref } from 'vue';
import type { Bucket } from '@/types';

// Store
const bucketStore = useBucketStore();
const { getUserId } = storeToRefs(useAuthStore());
const { getConfig } = storeToRefs(useConfigStore());

// State
const sidebarInfo: Ref<Bucket | undefined> = ref(undefined);
const displayBucketConfig: Ref<boolean> = ref(false);
const bucketConfigTitle: Ref<string> = ref(BucketConfig.TITLE_NEW_BUCKET);
const bucketToUpdate: Ref<Bucket | undefined> = ref(undefined);

// Actions
const showSidebarInfo = async (bucketId: string) => {
  sidebarInfo.value = bucketStore.findBucketById(bucketId);
};

const closeSidebarInfo = () => {
  sidebarInfo.value = undefined;
};

const showBucketConfig = (bucket?: Bucket) => {
  bucketConfigTitle.value = bucket?.bucketName || BucketConfig.TITLE_NEW_BUCKET;
  bucketToUpdate.value = bucket;
  displayBucketConfig.value = true;
};

const closeBucketConfig = () => {
  displayBucketConfig.value = false;
};

onMounted(async () => {
  await bucketStore.fetchBuckets({ userId: getUserId.value, objectPerms: true });
});
</script>

<template>
  <div>
    <div>
      <h1>Select a bucket</h1>
      <h3>Buckets are containers for storing objects.</h3>
      <Message
        v-if="getConfig?.notificationBanner"
        severity="warn"
      >
        {{ getConfig?.notificationBanner }}
      </Message>
    </div>
    <div class="flex justify-content-end">
      <Button
        v-if="usePermissionStore().isUserElevatedRights()"
        label="Primary"
        class="p-button-outlined mt-4"
        @click="showBucketConfig()"
      >
        <font-awesome-icon icon="fa-solid fa-plus" />
        Connect bucket to BCBox
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

        <Message severity="info">
          Please contact <a
            href="https://apps.nrs.gov.bc.ca/int/jira/servicedesk/customer/portal/1/create/701"
            target="_blank"
          >NRIDS Optimization</a>
          (Natural Resource ministries) or your ministry's service desk if you need help with buckets.
        </Message>

        <Message severity="warn">
          If you intend to share files in your bucket with BCeID users, you are required to email
          <a href="mailto:IDIM.Consulting@gov.bc.ca">IDIM.Consulting@gov.bc.ca</a> to share your
          BCeID-related intentions and where you intend to advertise this.
        </Message>

        <BucketConfigForm
          :bucket="bucketToUpdate"
          @submit-bucket-config="closeBucketConfig"
          @cancel-bucket-config="closeBucketConfig"
        />
      </Dialog>
    </div>
    <div class="flex">
      <div class="flex-grow-1">
        <BucketTable
          @show-sidebar-info="showSidebarInfo"
          @show-bucket-config="showBucketConfig"
        />
      </div>
      <div
        v-if="sidebarInfo"
        class="flex-shrink-0 ml-3"
        style="max-width: 33%; min-width: 33%"
      >
        <BucketSidebar
          :sidebar-info="sidebarInfo"
          @close-sidebar-info="closeSidebarInfo"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
h1 {
  font-weight: bold;
}

button {
  text-indent: 10px;
}
</style>
