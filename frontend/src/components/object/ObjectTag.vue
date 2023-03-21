<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onMounted, ref, watch } from 'vue';

import { Button } from '@/lib/primevue';
import { useTagStore } from '@/store';

import type { Ref } from 'vue';
import type { Tagging } from '@/types';

// Props
type Props = {
  objectInfoId: string;
};

const props = withDefaults(defineProps<Props>(), {});

// Store
const tagStore = useTagStore();
const { getTagging } = storeToRefs(tagStore);

// State
const objectTagging: Ref<Tagging | undefined> = ref(undefined);

// Actions
async function load() {
  objectTagging.value = tagStore.findTaggingByObjectId(props.objectInfoId);
}

onMounted(() => {
  load();
});

watch( [props, getTagging], () => {
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
