<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import Button from 'primevue/button';
import { useTagStore } from '@/store';

import type { Ref } from 'vue';
import type { Tagging } from '@/interfaces';

const tagStore = useTagStore();

const props = defineProps<{
  objectInfoId: string;
}>();

const objectTagging: Ref<Tagging | undefined> = ref(undefined);

async function load() {
  await tagStore.fetchTagging({objId: props.objectInfoId});
  objectTagging.value = tagStore.getTaggingByObjectId(props.objectInfoId);
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
    v-if="objectTag?.tagset?.length"
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
