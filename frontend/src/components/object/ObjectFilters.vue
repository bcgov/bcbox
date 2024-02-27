<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { ref, computed } from 'vue';

import { MultiSelect } from '@/lib/primevue';
import { useMetadataStore, useObjectStore, useTagStore } from '@/store';

import type { MetadataPair, Tag } from '@/types';
import type { MultiSelectChangeEvent } from 'primevue/multiselect';
import type { Ref } from 'vue';

type FilterDisplayItem = {
  key: string;
  value: string;
  display?: string;
};

// Props
type Props = {
  bucketId?: string;
};

const props = withDefaults(defineProps<Props>(), {
  bucketId: undefined
});

// Store
const metadataStore = useMetadataStore();
const objectStore = useObjectStore();
const tagStore = useTagStore();
const { getMetadataSearchResults } = storeToRefs(useMetadataStore());
const { getTagSearchResults } = storeToRefs(useTagStore());

// State
const searching = ref(false);
const selectedMetadata: Ref<MetadataPair[]> = ref([]);
const selectedTags: Ref<Tag[]> = ref([]);

// Emits
const emit = defineEmits(['selectedFilters']);

// Store subscriptions
objectStore.$onAction(({ name, args }) => {
  // If someone calls fetchObjects to refresh the table, clear the filter
  // unless supplied with filter(s)
  if (name === 'fetchObjects') {
    // Args are supplied from onAction as a single array so have to check how many to satisfy needed condition
    // Might be a cleaner way of doing this...
    if (args.length < 2) {
      selectedMetadata.value = [];
      selectedTags.value = [];
    }
  }
});

// Computed
const metadataValues = computed(() => {
  const filteredVals = getMetadataSearchResults.value;
  return (
    filteredVals
      // Take the metadata for the objects, and flatten them into a single array
      .flatMap((obj) => obj.metadata)
      // Add a display property to each tag to be used by the multiselect
      .map((val) => ({ ...val, display: `${val.key}:${val.value}` }))
      // Unique by display property
      .filter((val, index, self) => index === self.findIndex((t) => t.display === val.display))
      .sort((a, b) => a.display.localeCompare(b.display))
  );
});

const tagsetValues = computed(() => {
  const filteredVals = getTagSearchResults.value;

  return (
    filteredVals
      // Take the tags for the objects, and flatten them into a single array
      .flatMap((obj) => obj.tagset)
      // Add a display property to each tag to be used by the multiselect
      .map((val) => ({ ...val, display: `${val.key}=${val.value}` }))
      // Unique by display property
      .filter((val, index, self) => index === self.findIndex((t) => t.display === val.display))
      .sort((a, b) => a.display.localeCompare(b.display))
  );
});

// Actions
const uncheckOther = (event: MultiSelectChangeEvent, modelValue: Ref<MetadataPair[] | Tag[]>) => {
  if (event.value.length > 1) {
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
  // e.g. if 'colour=red' is selected, unselect any other tags that have 'colour' as the key
  uncheckOther(event, selectedTags);
  selectedFilterValuesChanged();
};
const selectedFilterValuesChanged = () => {
  // Get the 'display' property out from selected tag and metadata
  const metaToSearch: Array<MetadataPair> = selectedMetadata.value.map(({ ...meta }: any) => meta);
  const tagSetToSearch: Array<Tag> = selectedTags.value.map(({ ...tag }: any) => tag);
  emit('selectedFilters', { metaToSearch, tagSetToSearch });
  // Search the object store with the tagset as a param and metadata as headers
};

const searchMetadata = async () => {
  searching.value = true;
  await metadataStore.searchMetadata([], props.bucketId);
  searching.value = false;
};

const searchTagging = async () => {
  searching.value = true;
  await tagStore.searchTagging([], props.bucketId);
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
