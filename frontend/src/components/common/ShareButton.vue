<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, ref } from 'vue';

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { Invite, Share } from '@/components/common';
import { Button, Dialog, TabView, TabPanel } from '@/lib/primevue';

import { Permissions } from '@/utils/constants';
import { useAuthStore, useObjectStore, usePermissionStore, useBucketStore, useNavStore } from '@/store';
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
      <font-awesome-icon
        icon="fa-solid fa-share-alt"
        fixed-width
      />
      <span
        id="share_dialog_label"
        class="p-dialog-title"
      >
        Share
      </span>
    </template>
    <div
      tabindex="0"
      role="document"
    >
      <h3 class="bcbox-info-dialog-subhead">
        {{ resourceType === 'object' ? resource?.name : resource?.bucketName }}
      </h3>
      <ul
        id="share_dialog_desc"
        class="mb-4"
      >
        <li>If a user already has permissions, you can link them with a share link</li>
        <li>
          Invite someone using an invite link - the links are single-use; you must generate a new link for each user you
          intend to send this to
        </li>
        <li>
          To share publicly or with a direct link, you must set the file to public - this only works for individual
          files
        </li>
      </ul>
    </div>
    <TabView>
      <TabPanel
        v-if="resource?.public"
        header="Direct public file link"
      >
        <Share
          label="Direct link"
          :resource-type="resourceType"
          :resource="resource"
        />
      </TabPanel>
      <!-- Disable for public until unauthed File Details page works -->
      <TabPanel
        header="Share link"
        :disabled="resource?.public"
      >
        <Share
          label="Share link"
          :resource-type="resourceType"
          :resource="resource"
        />
      </TabPanel>
      <TabPanel
        :header="`${resourceType === 'object' ? 'File' : 'Folder'} invite`"
        :disabled="!hasManagePermission"
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
    <font-awesome-icon icon="fa-solid fa-share-alt" />
  </Button>
</template>

<style scoped lang="scss">
ul {
  padding-left: 22px;
}
</style>
