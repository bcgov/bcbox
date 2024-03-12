<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import { storeToRefs } from 'pinia';

import { RequirePublicOrAuth } from '@/components/guards';
import { ObjectFileDetails } from '@/components/object';
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
const { getLatestVersionIdByObjectId } = storeToRefs(versionStore);

// State
const versionId: Ref<string | undefined> = ref(props.versionId);

onBeforeMount(async () => {
  // Always load version data
  if (props.objectId) {
    await versionStore.fetchVersions({ objectId: props.objectId });

    if (!versionId.value) {
      versionId.value = getLatestVersionIdByObjectId.value(props.objectId);
    }
  }
});
</script>

<template>
  <RequirePublicOrAuth :object-id="props.objectId">
    <ObjectFileDetails
      v-if="props.objectId && versionId"
      :object-id="props.objectId"
      :version-id="versionId"
    />
    <div v-else>
      <h3 class="font-bold">No object or version provided</h3>
    </div>
  </RequirePublicOrAuth>
</template>
