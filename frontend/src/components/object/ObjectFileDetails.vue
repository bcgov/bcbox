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
import { InviteButton } from '@/components/common';
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
const { getVersionsByObjectId, getLatestVersionIdByObjectId } = storeToRefs(versionStore);

// State
const object: Ref<COMSObject | undefined> = ref(undefined);
const bucketId: Ref<string> = ref('');

const currentVersionId: Ref<string | undefined> = ref(props.versionId);
const latestVersionId = computed(() => getLatestVersionIdByObjectId.value(props.objectId));
const permissionsVisible: Ref<boolean> = ref(false);

async function onVersionsChanged() {
  await Promise.all([
    versionStore.fetchVersions({ objectId: props.objectId }),
    metadataStore.fetchMetadata({ objectId: props.objectId }),
    tagStore.fetchTagging({ objectId: props.objectId })
  ]).then(async () => {
    currentVersionId.value = latestVersionId.value;

    await Promise.all([
      versionStore.fetchMetadata({ objectId: props.objectId }),
      versionStore.fetchTagging({ objectId: props.objectId })
    ]);
  });
}

onMounted(async () => {
  const head = await objectStore.headObject(props.objectId);

  await permissionStore.fetchBucketPermissions({ userId: getUserId.value, objectPerms: true });
  await objectStore.fetchObjects({ objectId: props.objectId, userId: getUserId.value, bucketPerms: true });
  object.value = getObject.value(props.objectId);
  const bucketId = object.value?.bucketId;
  if (
    head?.status !== 204 &&
    (!object.value ||
      !permissionStore.isObjectActionAllowed(object.value.id, getUserId.value, Permissions.READ, object.value.bucketId))
  ) {
    router.replace({ name: RouteNames.FORBIDDEN });
  }
  // fetch data for child components
  await Promise.all([
    bucketStore.fetchBuckets({ bucketId: bucketId }),
    versionStore.fetchVersions({ objectId: props.objectId }),
    metadataStore.fetchMetadata({ objectId: props.objectId }),
    tagStore.fetchTagging({ objectId: props.objectId }),
    versionStore.fetchTagging({ objectId: props.objectId }),
    versionStore.fetchMetadata({ objectId: props.objectId })
  ]);
});
</script>

<template>
  <div v-if="object">
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
            {{ object.name }}
          </h2>
        </div>

        <div class="action-buttons">
          <InviteButton
            :object-id="props.objectId"
            label-text="Object"
          />
          <DownloadObjectButton
            v-if="
              object.public || permissionStore.isObjectActionAllowed(object.id, getUserId, Permissions.READ, bucketId)
            "
            :mode="ButtonMode.ICON"
            :ids="[object.id]"
            :version-id="currentVersionId"
          />
          <Button
            v-if="permissionStore.isObjectActionAllowed(object.id, getUserId, Permissions.MANAGE, bucketId)"
            v-tooltip.bottom="'Object permissions'"
            class="p-button-lg p-button-text"
            aria-label="Object permissions"
            @click="permissionsVisible = true"
          >
            <font-awesome-icon icon="fa-solid fa-users" />
          </Button>
          <DeleteObjectButton
            v-if="permissionStore.isObjectActionAllowed(object.id, getUserId, Permissions.DELETE, bucketId)"
            :mode="ButtonMode.ICON"
            :ids="[object.id]"
            :version-id="currentVersionId"
            :disabled="getVersionsByObjectId(object.id).length === 1"
            @on-deleted-success="onVersionsChanged"
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
          :editable="currentVersionId === latestVersionId"
          :object-id="object.id"
          @on-metadata-success="onVersionsChanged"
        />
      </div>
      <Divider layout="vertical" />
      <div class="flex flex-column w-6 gap-4 xl:pl-3 py-5">
        <div class="flex flex-row-reverse">
          <ObjectUploadBasic
            v-if="permissionStore.isObjectActionAllowed(object.id, getUserId, Permissions.UPDATE, object.bucketId)"
            :bucket-id="bucketId"
            :object-id="object.id"
            @on-file-uploaded="onVersionsChanged"
          />
        </div>
        <ObjectVersion
          v-model:version-id="currentVersionId"
          :bucket-id="bucketId"
          :object-id="object.id"
          @on-deleted-success="onVersionsChanged"
        />
        <ObjectTag
          v-model:version-id="currentVersionId"
          :object-id="object.id"
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
      <font-awesome-icon
        icon="fas fa-users"
        fixed-width
      />
      <span class="p-dialog-title">Object Permissions</span>
    </template>

    <h3 class="bcbox-info-dialog-subhead">
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
