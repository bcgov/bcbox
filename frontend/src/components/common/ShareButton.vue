<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, ref } from 'vue';

import { Invite, Share } from '@/components/common';
import { Button, Dialog, TabView, TabPanel, Tag } from '@/lib/primevue';

import { Permissions } from '@/utils/constants';
import { useAuthStore, useObjectStore, usePermissionStore, useBucketStore, useNavStore } from '@/store';
import { useConfigStore } from '@/store';
import { onDialogHide } from '@/utils/utils';

import type { Ref } from 'vue';

// Props
type Props = {
  bucketId?: string;
  objectId?: string;
  labelText: string;
};

// TODO: define a stricter type using a union of COMSObject | Bucket
type Resource = any;

const props = withDefaults(defineProps<Props>(), {
  bucketId: '',
  objectId: '',
  labelText: ''
});

// Store
const objectStore = useObjectStore();
const bucketStore = useBucketStore();
const { getUserId } = storeToRefs(useAuthStore());
const permissionStore = usePermissionStore();
const { focusedElement } = storeToRefs(useNavStore());
const { getConfig } = storeToRefs(useConfigStore());

// State
const resourceType = props.objectId ? ref('object') : ref('bucket');
const resource: Ref<Resource | undefined> = computed(() => {
  return props.objectId ? objectStore.getObject(props.objectId) : bucketStore.getBucket(props.bucketId);
});
/* eslint-disable */
const hasManagePermission: Ref<boolean> = computed(() => {
  /* eslint-disable */
  return resourceType.value === 'object'
    ? permissionStore.isObjectActionAllowed(
        props.objectId,
        getUserId.value,
        Permissions.MANAGE,
        resource.value?.bucketId
      )
    : permissionStore.isBucketActionAllowed(props.bucketId, getUserId.value, Permissions.MANAGE);
  /* eslint-enable */
});

// get share links
const downloadLink = `${getConfig.value.coms?.apiPath}/object/${props.objectId}`;
const bcboxLink: Ref<string> = computed(() => {
  const baseUrl = window.location.origin;
  if (resourceType.value === 'bucket') return `${baseUrl}/list/objects?bucketId=${props.bucketId}`;
  else return `${baseUrl}/detail/objects?objectId=${props.objectId}`;
});

// Dialog
const displayShareDialog = ref(false);

const showDialog = (x: boolean) => {
  displayShareDialog.value = x;
  if (displayShareDialog.value) {
    focusedElement.value = document.activeElement;
  }
};
</script>

<template>
  <Dialog
    id="share_dialog"
    v-model:visible="displayShareDialog"
    header="Share"
    :modal="true"
    :style="{ minWidth: '700px' }"
    class="bcbox-info-dialog"
    aria-labelledby="share_dialog_label"
    aria-describedby="share_dialog_desc"
    focus-trap
    @after-hide="onDialogHide"
  >
    <template #header>
      <span class="material-icons-outlined">ios_share</span>
      <span
        id="share_dialog_label"
        class="p-dialog-title flex-grow-0"
      >
        Share
      </span>
      <span class="ml-3 text-sm flex-grow-1">
        <Tag
          v-if="resource?.public"
          v-tooltip="
            `This ${resourceType === 'object' ? 'file is' : 'folder and its contents are'} set to public. 
              Change the settings in &quot;${resourceType === 'object' ? 'File' : 'Folder'} Permissions.&quot;`
          "
          value="Public"
          severity="danger"
          rounded
          icon="pi pi-info-circle"
        />
      </span>
    </template>
    <div
      tabindex="0"
      role="document"
    >
      <h3 class="bcbox-info-dialog-subhead">
        Sharing:
        <font-awesome-icon
          icon="fa-solid fa-folder"
          class="mx-2 mt-2"
        />
        {{ resourceType === 'object' ? resource?.name : resource?.bucketName }}
      </h3>
    </div>
    <TabView>
      <!-- public file download link -->
      <TabPanel
        v-if="resourceType === 'object' && resource?.public"
        :header="`Public download link`"
      >
        <Share
          link-type="public-file"
          :share-link="downloadLink"
        />
      </TabPanel>

      <!-- file share link -->
      <TabPanel
        v-if="resourceType === 'object' && !resource?.public"
        :header="`Share link`"
      >
        <Share
          link-type="share-file"
          :share-link="bcboxLink"
        />
      </TabPanel>

      <!-- folder share link -->
      <TabPanel
        v-if="resourceType === 'bucket'"
        :header="`${resource?.public && resourceType === 'bucket' ? 'Public share' : 'Share'} link`"
      >
        <Share
          :link-type="`share-${resource?.public ? 'public-' : ''}folder`"
          :share-link="bcboxLink"
        />
      </TabPanel>

      <!-- Invite -->
      <TabPanel
        v-if="hasManagePermission"
        :header="`${resourceType === 'object' ? 'File' : 'Folder'} invite`"
      >
        <Invite
          :resource-type="resourceType"
          :resource="resource"
        />
      </TabPanel>
    </TabView>
  </Dialog>
  <Button
    v-tooltip.bottom="`Share ${props.labelText.toLocaleLowerCase()}`"
    class="p-button-lg p-button-text primary"
    :aria-label="`Share ${props.labelText.toLocaleLowerCase()}`"
    @click="showDialog(true)"
  >
    <span class="material-icons-outlined">ios_share</span>
  </Button>
</template>

<style lang="scss" scoped>
.p-tabview {
  margin-top: 1rem;
}
:deep(.p-tabview-panels) {
  padding-left: 0;
  .p-tabview-panel {
    padding-top: 1rem;
  }
}
</style>
