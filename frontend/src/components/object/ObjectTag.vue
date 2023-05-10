<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onMounted, ref, watch } from 'vue';

import { Button } from '@/lib/primevue';
import { useTagStore, useVersionStore } from '@/store';

import type { Ref } from 'vue';
import type { Tagging } from '@/types';

// Props
type Props = {
  objectId: string;
  versionId?: string;
};

const props = withDefaults(defineProps<Props>(), {
  versionId: undefined
});

// Store
const tagStore = useTagStore();
const versionStore = useVersionStore();
const { getTagging: tsGetTagging } = storeToRefs(tagStore);
const { getTagging: vsGetTagging } = storeToRefs(versionStore);

// State
const objectTagging: Ref<Tagging | undefined> = ref(undefined);

// Actions
async function load() {
  if( props.versionId ) {
    objectTagging.value = versionStore.findTaggingByVersionId(props.versionId);
  }
  else {
    objectTagging.value = tagStore.findTaggingByObjectId(props.objectId);
  }
}

onMounted(() => {
  load();
});

watch( [props, tsGetTagging, vsGetTagging], () => {
  load();
});
</script>

<template>
  <div
    v-if="objectTagging?.tagset.length"
    class="grid details-grid grid-nogutter mb-2"
  >
    <div class="col-12">
      <h2 class="font-bold">
        Tags
      </h2>
    </div>
    <div
      v-for="tag in objectTagging?.tagset"
      :key="tag.key + tag.value"
    >
      <div class="col-3">
        <Button
          label="Primary"
          class="p-button-raised p-button-rounded"
        >
          {{ tag.key + "=" + tag.value }}
        </Button>
      </div>
    </div>
  </div>
</template>
