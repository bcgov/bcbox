<script setup lang="ts">
import { onBeforeMount, ref, watch } from 'vue';

import { RequirePublicOrAuth } from '@/components/guards';
import { ObjectFileDetails } from '@/components/object';
import { useVersionStore } from '@/store';

import type { Ref } from 'vue';

// Props
type Props = {
  objectId: string,
  versionId?: string
};

const props = withDefaults(defineProps<Props>(), {
  versionId: undefined
});

// Store
const versionStore = useVersionStore();

// State
const version: Ref<string | undefined> = ref(props.versionId);

// Actions
onBeforeMount( async () => {
  // Get the latest version if not defined
  if( !version.value ) {
    await versionStore.fetchVersions({objectId: props.objectId});
    version.value = versionStore.findLatestVersionIdByObjectId(props.objectId);
  }
});

watch( [props], () => {
  if( props.versionId ) {
    version.value = props.versionId;
  }
});

</script>

<template>
  <RequirePublicOrAuth
    :object-id="props.objectId"
  >
    <ObjectFileDetails
      v-if="props.objectId"
      :object-id="props.objectId"
      :version-id="version"
    />
    <div v-else>
      <h3>No object or version provided</h3>
    </div>
  </RequirePublicOrAuth>
</template>

<style lang="scss" scoped>
h3 {
  font-weight: bold;
}
</style>
