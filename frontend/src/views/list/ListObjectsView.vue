<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, onBeforeMount, onErrorCaptured, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import { ShareButton } from '@/components/common';
import { ObjectList } from '@/components/object';
import { BucketChildConfig, BucketConfigForm, BucketPermission } from '@/components/bucket';

import { Button, Dialog, Message, Tag, useConfirm, useToast } from '@/lib/primevue';
import { useAuthStore, useBucketStore, useNavStore, usePermissionStore } from '@/store';
import { RouteNames, Permissions } from '@/utils/constants';
import { onDialogHide } from '@/utils/utils';

import type { Ref } from 'vue';
import type { Bucket } from '@/types';

// Props
type Props = {
  bucketId: string;
};

const props = withDefaults(defineProps<Props>(), {
  bucketId: undefined
});

// Store
const bucketStore = useBucketStore();
const { getUserId, getIsAuthenticated } = storeToRefs(useAuthStore());
const permissionStore = usePermissionStore();
const toast = useToast();
const { focusedElement } = storeToRefs(useNavStore());

// State
const ready: Ref<boolean> = ref(false);
const bucket: Ref<Bucket | undefined> = ref(undefined);
const permissionsVisible: Ref<boolean> = ref(false);
const permissionsBucketId: Ref<string> = ref('');
const permissionBucketName: Ref<string> = ref('');
const displayBucketConfig: Ref<boolean> = ref(false);

// make public flag reactive
const isBucketPublic = computed(() => {
  const bucket = bucketStore.getBucket(props.bucketId);
  return bucket?.public || false;
});
// on public change, re-mount ObjectList
watch(isBucketPublic, () => remountComponent());
const componentKey = ref(0);
const remountComponent = () => (componentKey.value += 1);
// show permissions modal
const showPermissions = async (bucketId: string, bucketName: string) => {
  permissionsVisible.value = true;
  permissionsBucketId.value = bucketId;
  permissionBucketName.value = bucketName;
  focusedElement.value = document.activeElement;
};
// folder settings
const showBucketConfig = () => {
  displayBucketConfig.value = true;
};
const closeBucketConfig = () => {
  displayBucketConfig.value = false;
  onDialogHide();
};

// delete folder dialog
const confirm = useConfirm();
const confirmDeleteBucket = (bucketId: string) => {
  focusedElement.value = document.activeElement;
  confirm.require({
    message:
      'Are you sure you want delete this folder in BCBox? \
      This will drop all sub-folders and related objects and permissions from BCBox, \
      but the files will still remain in the storage location. \
      To delete the files from your storage location, please use controls in the table below.',
    header: 'Delete folder',
    acceptLabel: 'Confirm',
    rejectLabel: 'Cancel',
    accept: () => deleteBucket(bucketId, true),
    onHide: () => onDialogHide(),
    reject: () => onDialogHide()
  });
};
async function deleteBucket(bucketId: string, recursive = true) {
  await bucketStore.deleteBucket(bucketId, recursive);
  await bucketStore.fetchBuckets({ userId: getUserId.value, objectPerms: true });
}

// check if in a subfolder or at highest level of mounted folders
const isTopBucket = computed(() => bucketStore.isTopBucket);

onErrorCaptured((e: Error) => {
  toast.error('Loading folder', e.message, { life: 0 });
});

onBeforeMount(async () => {
  const router = useRouter();

  // fetch bucket; populate bucket and permissions in store
  let bucketResponse: any = [];
  if (props?.bucketId) {
    if (getIsAuthenticated.value) {
      bucketResponse = await bucketStore.fetchBuckets({
        bucketId: props.bucketId,
        userId: getUserId.value,
        objectPerms: true
      });
    } else {
      bucketResponse = [await bucketStore.fetchBucket(props.bucketId)];
    }
  }

  if (bucketResponse?.length) {
    bucket.value = bucketResponse[0];

    ready.value = true;
  } else {
    router.replace({ name: RouteNames.FORBIDDEN });
  }
});
</script>
<template>
  <div v-if="ready">
    <h2
      v-if="bucket"
      class="mb-3 flex flex-align-baseline overflow-hidden"
    >
      <font-awesome-icon
        icon="fa-solid fa-folder"
        class="flex align-items-center mr-2 mt-2"
      />
      <span class="wrap-block w-11 flex flex-grow-1">
        {{ bucket.bucketName }}
        <span class="ml-3 flex align-items-center">
          <Tag
            v-if="isBucketPublic"
            v-tooltip="
              'This folder and its contents are set to public. Change the settings in &quot;Folder permissions.&quot;'
            "
            value="Public"
            severity="danger"
            rounded
            icon="pi pi-info-circle"
          />
        </span>
      </span>

      <ShareButton
        :bucket-id="bucket.bucketId"
        label-text="Folder"
      />
      <BucketChildConfig
        v-if="permissionStore.isBucketActionAllowed(bucket.bucketId, getUserId, Permissions.CREATE)"
        :parent-bucket="bucket"
      />
      <Button
        v-if="!isTopBucket && permissionStore.isBucketActionAllowed(bucket.bucketId, getUserId, Permissions.MANAGE)"
        v-tooltip.bottom="'Configure folder'"
        class="p-button-lg p-button-text"
        aria-label="Configure folder"
        @click="showBucketConfig()"
      >
        <span class="material-icons-outlined">settings</span>
      </Button>
      <Button
        v-if="permissionStore.isBucketActionAllowed(bucket.bucketId, getUserId, Permissions.MANAGE)"
        id="folder_permissions"
        v-tooltip.bottom="'Folder permissions'"
        class="p-button-lg p-button-text"
        aria-label="Folder permissions"
        @click="showPermissions(bucket.bucketId, bucket.bucketName)"
      >
        <span class="material-icons-outlined">supervisor_account</span>
      </Button>
      <Button
        v-if="!isTopBucket && permissionStore.isBucketActionAllowed(bucket.bucketId, getUserId, Permissions.DELETE)"
        v-tooltip.bottom="'Delete folder'"
        class="p-button-lg p-button-text"
        aria-label="Delete folder"
        @click="confirmDeleteBucket(bucket.bucketId)"
      >
        <span class="material-icons-outlined">delete</span>
      </Button>
    </h2>
    <ObjectList
      :key="componentKey"
      :bucket-id="props.bucketId"
      :is-bucket-public="isBucketPublic"
    />
  </div>

  <!-- eslint-disable vue/no-v-model-argument -->
  <Dialog
    id="permissions_dialog"
    v-model:visible="permissionsVisible"
    :draggable="false"
    :modal="true"
    class="bcbox-info-dialog"
    aria-labelledby="permissions_label"
    aria-describedby="permissions_desc"
    @after-hide="onDialogHide"
  >
    <!-- eslint-enable vue/no-v-model-argument -->
    <template #header>
      <span class="material-icons-outlined">supervisor_account</span>
      <span
        id="permissions_label"
        class="p-dialog-title"
      >
        Folder permissions
      </span>
    </template>

    <h3
      id="permissions_desc"
      class="bcbox-info-dialog-subhead"
    >
      Set permissions for:
      <br />
      <font-awesome-icon
        icon="fa-solid fa-folder"
        class="mr-2 mt-2"
      />
      {{ permissionBucketName }}
    </h3>

    <BucketPermission :bucket-id="permissionsBucketId" />
  </Dialog>

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
        Configure storage location source
      </span>
    </template>

    <h3
      id="config_dialog_label"
      class="bcbox-info-dialog-subhead"
    >
      {{ bucket?.bucketName }}
    </h3>

    <Message severity="warn">
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
    </Message>

    <BucketConfigForm
      :bucket="bucket"
      @submit-bucket-config="closeBucketConfig"
      @cancel-bucket-config="closeBucketConfig"
    />
  </Dialog>
</template>
<style scoped lang="scss">
.heading svg {
  color: $bcbox-primary;
}
</style>
