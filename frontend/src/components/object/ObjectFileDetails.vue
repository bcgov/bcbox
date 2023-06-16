<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onBeforeMount, ref, watch } from 'vue';
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
import { ShareObjectButton } from '@/components/object/share';
import { Button, Dialog, Divider, useToast } from '@/lib/primevue';
import {
  useAuthStore,
  useMetadataStore,
  useObjectStore,
  usePermissionStore,
  useTagStore,
  useVersionStore
} from '@/store';
import { Permissions, RouteNames } from '@/utils/constants';
import { ButtonMode } from '@/utils/enums';
import { formatDateLong } from '@/utils/formatters';

import type { Ref } from 'vue';
import type { COMSObject, Version } from '@/types';

// Props
type Props = {
  objectId: string,
  versionId?: string
};

const props = withDefaults(defineProps<Props>(), {
  versionId: undefined
});

// Store
const metadataStore = useMetadataStore();
const objectStore = useObjectStore();
const permissionStore = usePermissionStore();
const tagStore = useTagStore();
const versionStore = useVersionStore();
const { getObjects } = storeToRefs(objectStore);
const { getUserId } = storeToRefs(useAuthStore());

// State
const bucketId: Ref<string> = ref('');
const latestVersionId: Ref<string | undefined> = ref(undefined);
const obj: Ref<COMSObject | undefined> = ref(undefined);
const permissionsVisible: Ref<boolean> = ref(false);
const permissionsObjectId: Ref<string> = ref('');
const permissionsObjectName: Ref<string | undefined> = ref('');
const version: Ref<Version | undefined> = ref(undefined);

// Actions
const router = useRouter();
const toast = useToast();

const showPermissions = async (objectId: string) => {
  permissionsVisible.value = true;
  permissionsObjectId.value = objectId;
  permissionsObjectName.value = obj.value?.name;
};

async function onDeletedSuccess(versionId: string) {
  toast.success('File deleted');

  await Promise.all([
    objectStore.fetchObjects({objectId: props.objectId, userId: getUserId.value, bucketPerms: true}),
    versionStore.fetchVersions({ objectId: props.objectId })
  ]);

  // Navigate to new latest version if deleting active version
  if( props.versionId === versionId ) {
    router.push({ name: RouteNames.DETAIL_OBJECTS, query: {
      objectId: props.objectId,
      versionId: versionStore.findLatestVersionIdByObjectId(props.objectId)
    }});
  }
}

async function onFileUploaded() {
  await Promise.all([
    objectStore.fetchObjects({objectId: props.objectId, userId: getUserId.value, bucketPerms: true}),
    versionStore.fetchVersions({ objectId: props.objectId })
  ]);

  // Obtaining the version id and passing it to the route forces a destruct/construct of the component
  // Easier approach than attempting to in-place refresh all the data
  router.push({ name: RouteNames.DETAIL_OBJECTS, query: {
    objectId: props.objectId,
    versionId: versionStore.findLatestVersionIdByObjectId(props.objectId)
  }});
}

onBeforeMount( async () => {
  if( props.objectId ) {
    const head = await objectStore.headObject(props.objectId);
    let isPublic = head?.status === 204;

    await permissionStore.fetchBucketPermissions({userId: getUserId.value, objectPerms: true});
    await objectStore.fetchObjects({objectId: props.objectId, userId: getUserId.value, bucketPerms: true});
    obj.value = objectStore.findObjectById(props.objectId);
    const bucketId = obj.value?.bucketId;

    if( !isPublic &&
      ( !obj.value ||
        !permissionStore.isObjectActionAllowed(obj.value.id, getUserId.value, Permissions.READ, bucketId) ) ) {
      router.replace({ name: RouteNames.FORBIDDEN });
    }
  }
});

watch( [props, getObjects], async () => {
  await metadataStore.fetchMetadata({objectId: props.objectId});
  tagStore.fetchTagging({objectId: props.objectId});
  obj.value = objectStore.findObjectById(props.objectId);
  bucketId.value = obj.value?.bucketId || '';
  latestVersionId.value = versionStore.findLatestVersionIdByObjectId(props.objectId);

  if( props.versionId ) {
    await versionStore.fetchMetadata({versionId: props.versionId});
    versionStore.fetchTagging({versionId: props.versionId});
    version.value = versionStore.findVersionById(props.versionId);
  }
});
</script>

<template>
  <div v-if="obj">
    <div class="grid pol-0">
      <div class="col-12">
        <h1
          class="pl-1 font-bold heading"
        >
          <span v-if="latestVersionId !== props.versionId">
            Previous version:
            {{ formatDateLong(version?.createdAt as string) }}
          </span>
          <span v-else>
            File details
          </span>
        </h1>
      </div>
      <div class="flex col justify-content-start">
        <div class="flex col align-items-center heading">
          <font-awesome-icon
            icon="fa-solid fa-circle-info"
            style="font-size: 2rem"
          />
          <h1 class="pl-1 font-bold">
            {{ obj.name }}
          </h1>
        </div>

        <div
          class="action-buttons"
        >
          <ShareObjectButton
            :id="props.objectId"
          />
          <DownloadObjectButton
            v-if="obj.public || permissionStore.isObjectActionAllowed(
              props.objectId, getUserId, Permissions.READ, bucketId)"
            :mode="ButtonMode.ICON"
            :ids="[props.objectId]"
            :version-id="props.versionId"
          />
          <Button
            v-if="permissionStore.isObjectActionAllowed(
              props.objectId, getUserId, Permissions.MANAGE, bucketId)"
            class="p-button-lg p-button-text"
            @click="showPermissions(props.objectId)"
          >
            <font-awesome-icon icon="fa-solid fa-users" />
          </Button>
          <DeleteObjectButton
            v-if="permissionStore.isObjectActionAllowed(
              props.objectId, getUserId, Permissions.DELETE, bucketId)"
            :mode="ButtonMode.ICON"
            :ids="[props.objectId]"
            :version-id="props.versionId"
            :disabled="versionStore.findVersionsByObjectId(props.objectId).length === 1"
            @on-deleted-success="onDeletedSuccess"
          />
        </div>
      </div>
    </div>

    <div class="flex flex-row">
      <div class="flex flex-column w-6 gap-3 py-5">
        <ObjectProperties
          :object-id="props.objectId"
          :version-id="props.versionId"
          :full-view="true"
        />
        <ObjectAccess :object-id="props.objectId" />
        <ObjectMetadata
          :editable="props.versionId === latestVersionId"
          :object-id="props.objectId"
          :version-id="props.versionId"
          @on-file-uploaded="onFileUploaded"
        />
      </div>
      <Divider layout="vertical" />
      <div class="flex flex-column w-6 gap-3 py-5">
        <div class="flex flex-row-reverse">
          <ObjectUploadBasic
            v-if="permissionStore.isObjectActionAllowed(
              props.objectId, getUserId, Permissions.UPDATE, bucketId)"
            :bucket-id="bucketId"
            :object-id="props.objectId"
            @on-file-uploaded="onFileUploaded"
          />
        </div>
        <ObjectVersion
          v-if="props.versionId"
          :bucket-id="bucketId"
          :object-id="props.objectId"
          :version-id="props.versionId"
        />
        <ObjectTag
          :editable="props.versionId === latestVersionId"
          :object-id="props.objectId"
          :version-id="props.versionId"
          @on-file-uploaded="onFileUploaded"
        />
      </div>
    </div>
  </div>

  <!-- eslint-disable vue/no-v-model-argument -->
  <Dialog
    v-model:visible="permissionsVisible"
    :draggable="false"
    :modal="true"
    class="bcbox-info-dialog permissions-modal"
  >
    <!-- eslint-enable vue/no-v-model-argument -->
    <template #header>
      <font-awesome-icon
        icon="fas fa-users"
        fixed-width
      />
      <span class="p-dialog-title">Object Permissions</span>
    </template>

    <h3 class="bcbox-info-dialog-subhead">
      {{ permissionsObjectName }}
    </h3>

    <ObjectPermission :object-id="permissionsObjectId" />
  </Dialog>
</template>

<style scoped lang="scss">
.heading svg {
  color: $bcbox-primary;
}
</style>
