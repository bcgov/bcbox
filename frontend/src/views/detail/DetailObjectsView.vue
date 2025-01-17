<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import { storeToRefs } from 'pinia';

import { RequirePublicOrAuth } from '@/components/guards';
import { ObjectFileDetails } from '@/components/object';
import { Spinner } from '@/components/layout';
import { useVersionStore } from '@/store';

import type { Ref } from 'vue';

// Props
type Props = {
  objectId: string;
  versionId?: string;
};

const props = withDefaults(defineProps<Props>(), {
  versionId: undefined
});

// Store
const versionStore = useVersionStore();
const { getLatestNonDmVersionIdByObjectId } = storeToRefs(versionStore);

// State
const loading: Ref<boolean> = ref(true);
const versionId: Ref<string | undefined> = ref(props.versionId);

onBeforeMount(async () => {
  // Always load version data
  if (props.objectId) {
    await versionStore.fetchVersions({ objectId: props.objectId });

    if (!versionId.value) {
      versionId.value = getLatestNonDmVersionIdByObjectId.value(props.objectId);
    }
    loading.value = false;
  }
});
</script>

<template>
  <RequirePublicOrAuth :object-id="props.objectId">
    <div v-if="!loading">
      <ObjectFileDetails
        v-if="props.objectId && versionId"
        :object-id="props.objectId"
        :version-id="versionId"
      />
      <div v-else>
        <h3 class="font-bold">File not found</h3>
      </div>
    </div>
    <div v-else>
      <Spinner />
    </div>
  </RequirePublicOrAuth>
</template>
