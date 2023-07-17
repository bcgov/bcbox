<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { ref, computed } from 'vue';

import { MultiSelect } from '@/lib/primevue';
import { useMetadataStore, useObjectStore, useTagStore } from '@/store';

import type { MetadataPair, Tag } from '@/types';

// Props
type Props = {
  bucketId?: string;
};

const props = withDefaults(defineProps<Props>(), {
  bucketId: undefined,
});

// Store
const metadataStore = useMetadataStore();
const objectStore = useObjectStore();
const tagStore = useTagStore();
const { getMetadataSearchResults } = storeToRefs(useMetadataStore());
const { getTagSearchResults } = storeToRefs(useTagStore());

// State
const searching = ref(false);
const selectedMetadata = ref([]);
const selectedTags = ref([]);

// Computed
const metadataValues = computed(() => {
  // Take the metadata for all objects, distinct, and flatten them into a single array
  // Add a display property to each tag to be used by the multiselect
  const distinctVals = [
    ...new Set(getMetadataSearchResults.value.flatMap((obj) => obj.metadata)),
  ];
  return distinctVals
    .map((val) => ({ ...val, display: `${val.key}:${val.value}` }))
    .filter(
      (val, index, self) =>
        index === self.findIndex((t) => t.display === val.display)
    )
    .sort((a, b) => a.display.localeCompare(b.display));
});

const tagsetValues = computed(() => {
  // Take the tags for all objects, distinct, and flatten them into a single array
  // Add a display property to each tag to be used by the multiselect
  // coms-id not allowed as a tag to filter on by COMS
  const distinctVals = [
    ...new Set(getTagSearchResults.value.flatMap((obj) => obj.tagset)),
  ];
  return distinctVals
    .map((val) => ({ ...val, display: `${val.key}=${val.value}` }))
    .filter((val) => val.key !== 'coms-id')
    .filter(
      (val, index, self) =>
        index === self.findIndex((t) => t.display === val.display)
    )
    .sort((a, b) => a.display.localeCompare(b.display));
});

// Actions
const selectedFilterValuesChanged = () => {
  // Get the 'display' property out from selected tag and metadata
  const metaToSearch: Array<MetadataPair> = selectedMetadata.value.map(
    ({ ...meta }: any) => meta
  );
  const tagSetToSearch: Array<Tag> = selectedTags.value.map(
    ({ ...tag }: any) => tag
  );

  // Search the object store with the tagset as a param and metadata as headers
  objectStore.fetchObjects(
    {
      bucketId: props.bucketId,
    },
    tagSetToSearch,
    metaToSearch
  );
};

const searchMetadata = async () => {
  searching.value = true;
  //await 4 seconds
  await metadataStore.searchMetadata();
  searching.value = false;
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
    v-model="selectedMetadata"
    :options="metadataValues"
    :loading="searching"
    class="filterDropdown mr-4"
    display="chip"
    option-label="display"
    placeholder="Metadata"
    filter
    filter-placeholder="Search metadata"
    :show-toggle-all="false"
    @show="searchMetadata"
    @update:model-value="selectedFilterValuesChanged"
  />

  
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
    :show-toggle-all="false"
    @show="searchTagging"
    @update:model-value="selectedFilterValuesChanged"
  />
</template>

<style lang="scss" scoped>
.filterDropdown {
  min-width: 15rem;
  height: 2.45rem;
  :deep(.p-multiselect-token) {
    padding-bottom: 2px;
    padding-top: 2px;
  }
}
</style>
