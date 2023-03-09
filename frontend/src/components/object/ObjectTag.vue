<script setup lang="ts">
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

// State
const objectTagging: Ref<Tagging | undefined> = ref(undefined);

// Actions
async function load() {
  await tagStore.fetchTagging({objId: props.objectInfoId});
  objectTagging.value = tagStore.findTaggingByObjectId(props.objectInfoId);
}

onMounted(() => {
  load();
});

watch( props, () => {
  load();
});
</script>

<template>
  <div
    v-if="objectTagging?.tagset"
    class="grid"
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
