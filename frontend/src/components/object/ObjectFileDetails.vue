<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import {
  DeleteObjectButton,
  DownloadObjectButton,
  ObjectAccess,
  ObjectMetadata,
  ObjectPermission,
  ObjectProperties,
  ObjectTag,
  ObjectUploadBasic,
  ObjectVersion
} from '@/components/object';
import { ShareButton } from '@/components/common';
import { Button, Dialog, Divider, Tag } from '@/lib/primevue';
import {
  useAuthStore,
  useBucketStore,
  useMetadataStore,
  useObjectStore,
  usePermissionStore,
  useTagStore,
  useVersionStore
} from '@/store';
import { Permissions, RouteNames } from '@/utils/constants';
import { ButtonMode } from '@/utils/enums';

import type { Ref } from 'vue';
import type { COMSObject } from '@/types';

// Props
type Props = {
  objectId: string;
  versionId: string;
};

const props = withDefaults(defineProps<Props>(), {});

const router = useRouter();

// Store
const bucketStore = useBucketStore();
const metadataStore = useMetadataStore();
const objectStore = useObjectStore();
const permissionStore = usePermissionStore();
const tagStore = useTagStore();
const versionStore = useVersionStore();

const { getUserId } = storeToRefs(useAuthStore());
const { getObject } = storeToRefs(objectStore);
const {
  getIsDeleted,
  getLatestVersionIdByObjectId,
  getLatestNonDmVersionIdByObjectId,
  getVersionsByObjectId,
  getIsVersioningEnabled
} = storeToRefs(versionStore);

// State
const object: Ref<COMSObject | undefined> = ref(undefined);
const bucketId: Ref<string> = ref('');
const permissionsVisible: Ref<boolean> = ref(false);

// version stuff
const bucketVersioningEnabled = computed(() => getIsVersioningEnabled.value(props.objectId));
const currentVersionId: Ref<string | undefined> = ref(props.versionId);
const latestVersionId = computed(() => getLatestVersionIdByObjectId.value(props.objectId));
const allVersions = computed(() => getVersionsByObjectId.value(props.objectId));
const latestNonDmVersionId = computed(() => getLatestNonDmVersionIdByObjectId.value(props.objectId));

const isDeleted: Ref<boolean> = computed(() => getIsDeleted.value(props.objectId));

async function fetchFileDetails(objectId: string) {
  await Promise.all([
    versionStore.fetchVersions({ objectId: objectId }),
    metadataStore.fetchMetadata({ objectId: objectId }),
    tagStore.fetchTagging({ objectId: objectId })
  ]).then(async () => {
    await Promise.all([
      versionStore.fetchMetadata({ objectId: objectId }),
      versionStore.fetchTagging({ objectId: objectId })
    ]);
  });
}

async function onObjectDeleted({ hardDelete }: { hardDelete: boolean }) {
  // if doing hard delete redirect to parent folder
  if (hardDelete || !bucketVersioningEnabled.value) {
    router.push({ path: '/list/objects', query: { bucketId: bucketId.value } });
  } else {
    await fetchFileDetails(props.objectId);
    currentVersionId.value = latestNonDmVersionId.value;
  }
}

async function onVersionDeleted(changedVersionId: string | undefined, isVersion: boolean, hardDelete: boolean) {
  // if doing hard delete or no versions left, redirect to parent folder
  const otherVersions = allVersions.value.filter((v) => v.id !== changedVersionId);
  if (hardDelete || (isVersion && otherVersions.length === 0)) {
    router.push({ path: '/list/objects', query: { bucketId: bucketId.value } });
  }
  // else stay on page
  else {
    await fetchFileDetails(props.objectId);
    currentVersionId.value = latestNonDmVersionId.value;
  }
}

async function onVersionCreated() {
  await fetchFileDetails(props.objectId).then(() => {
    currentVersionId.value = latestNonDmVersionId.value;
  });
}

onMounted(async () => {
  const head = await objectStore.headObject(props.objectId);

  await objectStore.fetchObjects({ objectId: props.objectId, userId: getUserId.value, bucketPerms: true });
  object.value = getObject.value(props.objectId);
  bucketId.value = object.value ? object.value.bucketId : '';

  await permissionStore.fetchBucketPermissions({
    userId: getUserId.value,
    bucketId: bucketId.value,
    objectPerms: true
  });
  if (
    head?.status !== 204 &&
    !isDeleted.value &&
    (!object.value ||
      !permissionStore.isObjectActionAllowed(object.value.id, getUserId.value, Permissions.READ, object.value.bucketId))
  ) {
    router.replace({ name: RouteNames.FORBIDDEN });
  }
  // fetch data for child components
  await Promise.all([bucketStore.fetchBuckets({ bucketId: bucketId.value }), fetchFileDetails(props.objectId)]);
});
</script>

<template>
  <div v-if="object">
    <div class="grid grid-nogutter">
      <div class="flex col justify-content-start">
        <div class="flex col align-items-center heading pl-0">
          <span class="material-icons-outlined icon-large pr-2">info</span>
          <h2 class="">
            {{ object.name }}
          </h2>
          <span class="ml-3 text-sm flex-grow-1">
            <Tag
              v-if="object?.public"
              v-tooltip="`This file is set as public`"
              value="Public"
              severity="danger"
              rounded
              icon="pi pi-info-circle"
            />
          </span>
        </div>

        <div class="action-buttons mt-2">
          <ShareButton
            v-if="!isDeleted"
            :object-id="props.objectId"
            label-text="File"
          />
          <DownloadObjectButton
            v-if="
              (object.public ||
                permissionStore.isObjectActionAllowed(object.id, getUserId, Permissions.READ, bucketId)) &&
              !isDeleted
            "
            :mode="ButtonMode.ICON"
            :ids="[object.id]"
            :version-id="currentVersionId"
          />
          <Button
            v-if="
              permissionStore.isObjectActionAllowed(object.id, getUserId, Permissions.MANAGE, bucketId) && !isDeleted
            "
            v-tooltip.bottom="'File permissions'"
            class="p-button-lg p-button-text"
            aria-label="File permissions"
            @click="permissionsVisible = true"
          >
            <span class="material-icons-outlined">supervisor_account</span>
          </Button>
          <DeleteObjectButton
            v-if="permissionStore.isObjectActionAllowed(object.id, getUserId, Permissions.DELETE, bucketId)"
            class="xl"
            :mode="ButtonMode.ICON"
            :ids="[object.id]"
            :hard-delete="isDeleted || !bucketVersioningEnabled"
            @on-object-deleted="onObjectDeleted"
          />
        </div>
      </div>
    </div>

    <div class="flex flex-row">
      <div class="flex flex-column w-6 gap-3 py-5">
        <ObjectProperties
          :object-id="object.id"
          :full-view="true"
        />
        <ObjectAccess :object-id="object.id" />
        <ObjectMetadata
          v-model:version-id="currentVersionId"
          :editable="!isDeleted && currentVersionId === latestVersionId"
          :object-id="object.id"
          @on-metadata-success="onVersionCreated"
        />
      </div>
      <Divider layout="vertical" />
      <div class="flex flex-column w-6 gap-4 xl:pl-3 py-5">
        <div class="flex flex-row-reverse">
          <ObjectUploadBasic
            v-if="permissionStore.isObjectActionAllowed(object.id, getUserId, Permissions.UPDATE, object.bucketId)"
            :bucket-id="bucketId"
            :object-id="object.id"
            @on-file-uploaded="onVersionCreated"
          />
        </div>
        <ObjectVersion
          v-model:version-id="currentVersionId"
          :bucket-id="bucketId"
          :object-id="object.id"
          @on-object-deleted="onObjectDeleted"
          @on-version-deleted="onVersionDeleted"
          @on-version-restored="onVersionCreated"
        />
        <ObjectTag
          v-model:version-id="currentVersionId"
          :object-id="object.id"
          :editable="!isDeleted"
        />
      </div>
    </div>
  </div>

  <Dialog
    v-model:visible="permissionsVisible"
    :draggable="false"
    :modal="true"
    class="bcbox-info-dialog"
  >
    <template #header>
      <span class="material-icons-outlined">supervisor_account</span>
      <span class="p-dialog-title">File Permissions</span>
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
      {{ object?.name }}
    </h3>

    <ObjectPermission :object-id="props.objectId" />
  </Dialog>
</template>

<style scoped lang="scss">
.heading svg {
  color: $bcbox-primary;
}
</style>
