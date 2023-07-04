<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { ref, onMounted, computed } from 'vue';

import { MultiSelect } from '@/lib/primevue';
import { useTagStore } from '@/store';

// Store
const tagStore = useTagStore();
const { getTagSearchResults } = storeToRefs(useTagStore());

// State
const searching = ref(false);
const selectedTags = ref();

// Computed
const tagsetValues = computed(() => {
  // Take the tags for all objects, distinct, and flatten them into a single array
  const distinctVals = [
    ...new Set(getTagSearchResults.value.map((obj) => obj.tagset).flat()),
  ];
  // Add a display property to show in the dropdown and search on
  return distinctVals.map((val) => ({
    ...val,
    display: `${val.key}:${val.value}`,
  }));
});

// Actions

onMounted(async () => {
  searching.value = true;
  await tagStore.searchTagging();
  searching.value = false;
});
</script>

<template>
  {{ selectedTags }}
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
  />
</template>

<style lang="scss" scoped>
.filterDropdown {
  min-width: 15rem;
  height: 2.45rem;
}
</style>
