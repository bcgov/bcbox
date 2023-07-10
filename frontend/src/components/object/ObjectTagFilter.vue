<script setup lang="ts">
import { storeToRefs } from "pinia";
import { ref, onMounted, computed } from "vue";

import { MultiSelect } from "@/lib/primevue";
import { useObjectStore, useTagStore } from "@/store";

import type { Tag } from "@/types";

// Props
type Props = {
  bucketId?: string;
};

const props = withDefaults(defineProps<Props>(), {
  bucketId: undefined,
});

// Store
const objectStore = useObjectStore();
const tagStore = useTagStore();
const { getTagSearchResults } = storeToRefs(useTagStore());

// State
const searching = ref(false);
const selectedTags = ref();

// Computed
const tagsetValues = computed(() => {
  // Take the tags for all objects, distinct, and flatten them into a single array
  // Add a display property to each tag to be used by the multiselect
  // coms-id not allowed as a tag to filter on by COMS
  const distinctVals = [
    ...new Set(getTagSearchResults.value.flatMap((obj) => obj.tagset)),
  ];
  return distinctVals
    .map((val) => ({ ...val, display: `${val.key}:${val.value}` }))
    .filter((val) => val.key !== "coms-id")
    .filter(
      (val, index, self) =>
        index === self.findIndex((t) => t.display === val.display)
    )
    .sort((a, b) => a.display.localeCompare(b.display));
});

// Actions
const selectedValuesChanged = () => {
  // Just the tag objects, not the display property
  const tagSetToSearch: Array<Tag> = selectedTags.value.map(
    ({ display, ...rawTag }: any) => rawTag
  );
  // Search the object store with the tagset as a param
  objectStore.fetchObjects(
    {
      bucketId: props.bucketId,
    },
    tagSetToSearch
  );
};

const searchTagging = async () => {
  searching.value = true;
  //await 4 seconds
  await tagStore.searchTagging();
  searching.value = false;
};

</script>

<template>
  <MultiSelect
    v-model="selectedTags"
    :options="tagsetValues"
    :loading="searching"
    class="filterDropdown"
    display="chip"
    option-label="display"
    placeholder="Tags"
    filter
    filter-placeholder="Search tags"
    @show="searchTagging"
    :show-toggle-all="false"
    @update:model-value="selectedValuesChanged"
  >
    <template #optiongroup>
      <i class="pi pi-tag"></i>
    </template>
    <template #loader>
      test
    </template>
  </MultiSelect>
</template>

<style lang="scss" scoped>
.filterDropdown {
  min-width: 15rem;
  height: 2.45rem;
}
</style>
