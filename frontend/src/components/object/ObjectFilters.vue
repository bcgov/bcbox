<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { ref, computed } from 'vue';

import { MultiSelect } from '@/lib/primevue';
import { useMetadataStore, useObjectStore, useTagStore } from '@/store';
import { Permissions } from '@/utils/constants';

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
const { getUnfilteredObjectIds } = storeToRefs(useObjectStore());
const { getTagSearchResults } = storeToRefs(useTagStore());

// State
const searching = ref(false);
const selectedMetadata = ref([]);
const selectedTags = ref([]);

// Store subscriptions
objectStore.$onAction(
  ({name, args}) => {
    // If someone calls fetchObjects to refresh the table, clear the filter
    // unless supplied with filter(s)
    if (name === 'fetchObjects') {
      // Args are supplied from onAction as a single array so have to check how many to satisfy needed condition
      // Might be a cleaner way of doing this...
      if(args.length < 2) {
        selectedMetadata.value = [];
        selectedTags.value = [];
      }
    }
  }
);

// Computed
const metadataValues = computed(() => {
  // Filter out any tags that don't have an objectID that exist in getUnfilteredObjectIds
  const filteredVals = getMetadataSearchResults.value.filter((searchRes) =>
    getUnfilteredObjectIds.value.some((obj) => obj === searchRes.objectId)
  );

  return filteredVals
    // Take the metadata for the objects, and flatten them into a single array
    .flatMap((obj) => obj.metadata)
    // Add a display property to each tag to be used by the multiselect
    .map((val) => ({ ...val, display: `${val.key}:${val.value}` }))
    // Unique by display property
    .filter(
      (val, index, self) =>
        index === self.findIndex((t) => t.display === val.display)
    )
    .sort((a, b) => a.display.localeCompare(b.display));
});

const tagsetValues = computed(() => {
  // Filter out any tags that don't have an objectID that exist in getUnfilteredObjectIds
  const filteredVals = getTagSearchResults.value.filter((searchRes) =>
    getUnfilteredObjectIds.value.some((obj) => obj === searchRes.objectId)
  );

  return filteredVals
    // Take the tags for the objects, and flatten them into a single array
    .flatMap((obj) => obj.tagset)
    // Add a display property to each tag to be used by the multiselect
    .map((val) => ({ ...val, display: `${val.key}=${val.value}` }))
    // coms-id not allowed as a tag to filter on by COMS
    .filter((val) => val.key !== 'coms-id')
    // Unique by display property
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
      permCode: Permissions.READ
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
    :empty-message="searching ? 'Loading...' : 'No available options'"
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
    :empty-message="searching ? 'Loading...' : 'No available options'"
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
