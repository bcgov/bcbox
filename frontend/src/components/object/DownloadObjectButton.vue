<script setup lang="ts">
// Types
import { ButtonMode } from '@/interfaces/common/enums';
import type { PropType } from 'vue';

// PrimeVue/Font
import Button from 'primevue/button';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
// State
import { useObjectStore } from '@/store/objectStore';

const objectStore = useObjectStore();

// Props
const props = defineProps({
  mode: {
    type: String as PropType<ButtonMode>,
    required: true,
  },
  ids: {
    type: Array<string>,
    required: true,
  },
});

// Download the object(s)
const download = () => {
  // For now we are looping the supplied IDs (if multiple selected) until there is a batching feature
  props.ids.forEach((i) => {
    objectStore.getObject(i, undefined, true);
  });
};
</script>

<template>
  <Button v-if="mode === ButtonMode.ICON" class="p-button-lg p-button-text" @click="download()">
    <font-awesome-icon icon="fa-solid fa-download" />
  </Button>
  <Button v-else class="p-button-outlined" @click="download()"> <font-awesome-icon icon="fa-solid fa-download" class="mr-1" /> Download </Button>
</template>
