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

// Download the object
const download = () => {
  alert(`Not Implemented Yet (IDs ${props.ids})`);
};
</script>

<template>
  <Button v-if="mode === ButtonMode.ICON" class="p-button-lg p-button-text" @click="download()">
    <font-awesome-icon icon="fa-solid fa-download" />
  </Button>
  <Button v-else class="p-button-outlined" @click="download()"> <font-awesome-icon icon="fa-solid fa-download" class="mr-1" /> Download </Button>
</template>
