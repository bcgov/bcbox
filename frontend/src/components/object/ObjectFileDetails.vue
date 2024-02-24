<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, onBeforeMount, ref, watch } from 'vue';
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
import { Button, Dialog, Divider } from '@/lib/primevue';
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

// Props
type Props = {
  objectId: string;
  versionId?: string;
};

const props = withDefaults(defineProps<Props>(), {
  versionId: undefined
});

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
const { getVersionsByObjectId, getLatestVersionIdByObjectId } = storeToRefs(versionStore);

// State
const obj = computed((): any => getObject.value(props.objectId));
const latestVersionId = computed(() => getLatestVersionIdByObjectId.value(props.objectId));
const versionId = computed(() => props.versionId ?? latestVersionId.value);
const permissionsVisible: Ref<boolean> = ref(false);

function onDeletedSuccess() {
  router.push({
    name: RouteNames.DETAIL_OBJECTS,
    query: {
      objectId: props.objectId,
      versionId: latestVersionId.value
    }
  });
}

function onFileUploaded(newVersionId: string) {
  // Navigate to new version
  router.push({
    name: RouteNames.DETAIL_OBJECTS,
    query: {
      objectId: props.objectId,
      versionId: newVersionId
    }
  });
}

onBeforeMount(async () => {
  const head = await objectStore.headObject(props.objectId);
  const isPublic = head?.status === 204;

  await permissionStore.fetchBucketPermissions({ userId: getUserId.value, objectPerms: true });
  await objectStore.fetchObjects({ objectId: props.objectId, userId: getUserId.value, bucketPerms: true });
  if (
    !isPublic &&
    (!obj.value ||
      !permissionStore.isObjectActionAllowed(obj.value.id, getUserId.value, Permissions.READ, obj.value.bucketId))
  ) {
    router.replace({ name: RouteNames.FORBIDDEN });
  }
  // fetch data for child components
  await bucketStore.fetchBuckets({ bucketId: obj.value.bucketId });
  await versionStore.fetchVersions({ objectId: props.objectId });
  await metadataStore.fetchMetadata({ objectId: props.objectId });
  await tagStore.fetchTagging({ objectId: props.objectId });
  if (props.versionId) {
    await versionStore.fetchTagging({ versionId: props.versionId });
    await versionStore.fetchMetadata({ versionId: props.versionId });
  }
});

// refresh data from COMS
watch([props], async () => {
  await versionStore.fetchVersions({ objectId: props.objectId });
  await metadataStore.fetchMetadata({ objectId: props.objectId });
  await tagStore.fetchTagging({ objectId: props.objectId });
  if (props.versionId) {
    await versionStore.fetchTagging({ versionId: props.versionId });
    await versionStore.fetchMetadata({ versionId: props.versionId });
  }
});
</script>

<template>
  <div v-if="obj">
    <div class="grid grid-nogutter">
      <div class="col-12">
        <h1 class="heading">File details</h1>
      </div>
      <div class="flex col justify-content-start">
        <div class="flex col align-items-center heading">
          <font-awesome-icon
            icon="fa-solid fa-circle-info"
            class="text-3xl pr-3"
          />
          <h2 class="">
            {{ obj.name }}
          </h2>
        </div>

        <div class="action-buttons">
          <ShareObjectButton :id="props.objectId" />
          <DownloadObjectButton
            v-if="
              obj.public ||
              permissionStore.isObjectActionAllowed(props.objectId, getUserId, Permissions.READ, obj.bucketId)
            "
            :mode="ButtonMode.ICON"
            :ids="[props.objectId]"
            :version-id="props.versionId"
          />
          <Button
            v-if="permissionStore.isObjectActionAllowed(props.objectId, getUserId, Permissions.MANAGE, obj.bucketId)"
            v-tooltip.bottom="'Object permissions'"
            class="p-button-lg p-button-text"
            aria-label="Object permissions"
            @click="permissionsVisible = true"
          >
            <font-awesome-icon icon="fa-solid fa-users" />
          </Button>
          <DeleteObjectButton
            v-if="permissionStore.isObjectActionAllowed(props.objectId, getUserId, Permissions.DELETE, obj.bucketId)"
            :mode="ButtonMode.ICON"
            :ids="[props.objectId]"
            :version-id="props.versionId"
            :disabled="getVersionsByObjectId(props.objectId).length === 1"
            @on-deleted-success="onDeletedSuccess"
          />
        </div>
      </div>
    </div>

    <div class="flex flex-row">
      <div class="flex flex-column w-6 gap-3 py-5">
        <ObjectProperties
          :object-id="props.objectId"
          :version-id="versionId"
          :full-view="true"
        />
        <ObjectAccess :object-id="props.objectId" />
        <ObjectMetadata
          :editable="props.versionId === latestVersionId"
          :object-id="props.objectId"
          :version-id="versionId"
          @on-file-uploaded="onFileUploaded"
        />
      </div>
      <Divider layout="vertical" />
      <div class="flex flex-column w-6 gap-4 xl:pl-3 py-5">
        <div class="flex flex-row-reverse">
          <ObjectUploadBasic
            v-if="permissionStore.isObjectActionAllowed(props.objectId, getUserId, Permissions.UPDATE, obj.bucketId)"
            :bucket-id="obj.bucketId"
            :object-id="props.objectId"
            @on-file-uploaded="onFileUploaded"
          />
        </div>
        <ObjectVersion
          :bucket-id="obj?.bucketId"
          :object-id="props.objectId"
          :version-id="versionId"
        />
        <ObjectTag
          :object-id="props.objectId"
          :version-id="versionId"
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
    class="bcbox-info-dialog"
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
      {{ obj?.name }}
    </h3>

    <ObjectPermission :object-id="props.objectId" />
  </Dialog>
</template>

<style scoped lang="scss">
.heading svg {
  color: $bcbox-primary;
}
</style>
