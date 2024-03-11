<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, onMounted } from 'vue';

import GridRow from '@/components/form/GridRow.vue';
import { useBucketStore, useObjectStore, useUserStore } from '@/store';
import { RouteNames } from '@/utils/constants';
import { formatDateLong } from '@/utils/formatters';

import type { Ref } from 'vue';
import type { Bucket, COMSObject } from '@/types';

// Props
type Props = {
  objectId: string;
  fullView: boolean;
};
const props = withDefaults(defineProps<Props>(), {});

// Store
const bucketStore = useBucketStore();
const objectStore = useObjectStore();
const userStore = useUserStore();

const { getBucket } = storeToRefs(bucketStore);
const { getObject } = storeToRefs(objectStore);
const { getUser } = storeToRefs(userStore);

const object: Ref<COMSObject> = computed((): any => getObject.value(props.objectId));
const bucket: Ref<Bucket | undefined> = computed(() => getBucket.value(object.value?.bucketId as string));
const createdBy: Ref<string | undefined> = computed(() => getUser.value(object.value.createdBy)?.fullName);
const updatedBy: Ref<string | undefined> = computed(() => getUser.value(object.value?.updatedBy)?.fullName);

onMounted(() => {
  userStore.fetchUsers({ userId: [object.value?.createdBy, object.value?.updatedBy] });
});
</script>

<template>
  <div class="grid details-grid grid-nogutter mb-2">
    <div class="col-12">
      <h2>Properties</h2>
    </div>

    <GridRow
      class="overflow-hidden"
      label="Name"
      :value="object?.name"
    />
    <GridRow
      v-if="fullView"
      label="Bucket"
      :value="bucket?.bucketName"
      :link="{ name: RouteNames.LIST_OBJECTS, query: { bucketId: bucket?.bucketId } }"
    />
    <GridRow
      v-if="fullView"
      label="Bucket ID"
      :value="object?.bucketId"
    />
    <GridRow
      label="Object ID"
      :value="object?.id"
    />
    <GridRow
      v-if="fullView"
      label="Created by"
      :value="createdBy"
    />
    <GridRow
      v-if="fullView"
      label="Creation date"
      :value="formatDateLong(object?.createdAt as string)"
    />
    <GridRow
      label="Updated by"
      :value="updatedBy"
    />
    <GridRow
      label="Updated date"
      :value="formatDateLong(object?.updatedAt as string)"
    />
    <GridRow
      v-if="fullView"
      label="Last sync date"
      :value="formatDateLong(object?.lastSyncedDate as string)"
    />
  </div>
</template>
