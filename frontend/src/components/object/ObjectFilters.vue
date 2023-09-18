<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { ref, computed } from 'vue';

import { MultiSelect } from '@/lib/primevue';
import { useAuthStore, useMetadataStore, useObjectStore, useTagStore } from '@/store';
import { Permissions } from '@/utils/constants';

import type { MetadataPair, Tag } from '@/types';
import type { MultiSelectChangeEvent } from 'primevue/multiselect';
import type { Ref } from 'vue';

type FilterDisplayItem = {
  key: string;
  value: string;
  display?: string;
}

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
const { getUserId } = storeToRefs(useAuthStore());

// State
const searching = ref(false);
const selectedMetadata: Ref<MetadataPair[]> = ref([]);
const selectedTags: Ref<Tag[]> = ref([]);

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
const uncheckOther = (event: MultiSelectChangeEvent, modelValue: Ref<MetadataPair[] | Tag[]>) =>{
  if(event.value.length > 1) {
    // Docs say value should be the current selected, but it's the whole list. Current is always the last one
    const selectedOption = event.value[event.value.length - 1];
    const tagKey = selectedOption.key;
    // remove any other keys from multiselect list that match the key but keep the current one
    modelValue.value = modelValue.value.filter(
      (meta: FilterDisplayItem) => meta.key !== tagKey || meta.display === selectedOption.display
    );
  }
};
const selectedMetadataChanged = (event: MultiSelectChangeEvent) => {
  // Unselect any other metadata that have the same metadata key
  // e.g. if 'class:high' is selected, unselect any other metadata that have 'class' as the key
  uncheckOther(event, selectedMetadata);
  selectedFilterValuesChanged();
};
const selectedTagsChanged = (event: MultiSelectChangeEvent) => {
  // Unselect any other tags that have the same tag key
  // e.g. if 'coms-id=1234' is selected, unselect any other tags that have 'coms-id' as the key
  uncheckOther(event, selectedTags);
  selectedFilterValuesChanged();
};
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
      bucketPerms: true,
      permCode: Permissions.READ,
      userId: getUserId.value
    },
    tagSetToSearch,
    metaToSearch
  );
};

const searchMetadata = async () => {
  searching.value = true;
  await metadataStore.searchMetadata();
  searching.value = false;
};

const searchTagging = async () => {
  searching.value = true;
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
    @before-show="searchMetadata"
    @change="selectedMetadataChanged"
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
    @before-show="searchTagging"
    @change="selectedTagsChanged"
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
  :deep(.p-multiselect-label) {
    padding-top: 6px;
  }
}
</style>
