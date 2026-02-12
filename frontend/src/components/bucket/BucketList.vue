<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { ref, onMounted } from 'vue';

import { BucketConfigForm, BucketSidebar, BucketTable } from '@/components/bucket';
import { Button, Dialog, Message } from '@/lib/primevue';
import { useAuthStore, useBucketStore, useConfigStore, usePermissionStore } from '@/store';
import { BucketConfig } from '@/utils/constants';
import { onDialogHide } from '@/utils/utils';

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
  sidebarInfo.value = bucketStore.getBucket(bucketId);
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
  onDialogHide();
};

onMounted(async () => {
  await bucketStore.fetchBuckets({ userId: getUserId.value, objectPerms: true });
});
</script>

<template>
  <Message
    v-if="getConfig?.notificationBanner"
    severity="warn"
  >
    {{ getConfig?.notificationBanner }}
  </Message>

  <div class="flex flex-wrap">
    <div class="flex-grow-1">
      <h1 class="">My files</h1>
    </div>

    <div class="flex-none align-items-right">
      <Button
        v-if="usePermissionStore().isUserElevatedRights()"
        v-tooltip.bottom="'Add a new storage location source'"
        label="Connect Storage"
        class="mb-4 mt-1 p-button-primary"
        data-test="connect-storage"
        aria-label="Add a new storage location source"
        @click="showBucketConfig()"
        @keyup.enter="showBucketConfig()"
      >
        <span class="material-icons-outlined mr-2 primary">create_new_folder</span>
        Connect Storage
      </Button>

      <!-- Bucket config dialog -->
      <Dialog
        id="config_dialog"
        class="bcbox-info-dialog"
        :visible="displayBucketConfig"
        :style="{ width: '50vw' }"
        :modal="true"
        aria-labelledby="config_dialog_label"
        aria-describedby="config_dialog_desc"
        @update:visible="closeBucketConfig"
      >
        <template #header>
          <span class="material-icons-outlined">settings</span>
          <span
            id="config_dialog_label"
            class="p-dialog-title"
          >
            {{ BucketConfig.HEADER_NEW_BUCKET }}
          </span>
        </template>

        <h3
          id="config_dialog_label"
          class="bcbox-info-dialog-subhead mb-3"
        >
          {{ bucketConfigTitle }}
        </h3>

        <!-- <Message severity="warn">
          If you intend to share files in your bucket with BCeID or BC Services Card users, please notify
          <a href="mailto:IDIM.Consulting@gov.bc.ca">IDIM.Consulting@gov.bc.ca</a>
          that you plan to use BCBox.
        </Message>

        <Message severity="info">
          Please contact
          <a
            href="https://apps.nrs.gov.bc.ca/int/jira/servicedesk/customer/portal/1/create/701"
            target="_blank"
          >
            NRIDS Optimization
          </a>
          (Natural Resource ministries) or your ministry's service desk if you need help with &quot;bucket&quot; storage
          location sources.
        </Message> -->

        <BucketConfigForm
          :bucket="bucketToUpdate"
          @submit-bucket-config="closeBucketConfig"
          @cancel-bucket-config="closeBucketConfig"
        />
      </Dialog>
    </div>
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
      class="flex-shrink-0 w-4 pl-4 max-w-28rem"
    >
      <BucketSidebar
        :sidebar-info="sidebarInfo"
        @close-sidebar-info="closeSidebarInfo"
      />
    </div>
  </div>
</template>
