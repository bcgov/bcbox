<script setup lang="ts">
// PrimeVue
import Badge from 'primevue/badge';
import Button from 'primevue/button';
// Utils
import { filesize } from 'filesize';

defineProps({
  files: {
    type: Array<any>, // TODO: Change any to more specific type
    required: true,
  },
  badgeProps: {
    type: Object,
    required: true,
  },
  removeCallback: {
    type: Function,
    required: true,
  },
});
</script>

<template>
  <div v-if="files.length > 0">
    <div
      v-for="(file, index) of files"
      :key="file.name + file.type + file.size"
      class="card flex border-1 border-round surface-border align-items-center p-2 gap-3 mb-1 text-sm"
    >
      <img
        v-if="file.type.startsWith('image')"
        role="presentation"
        :alt="file.name"
        :src="file.objectURL"
        width="50"
      />
      <div>
        <span>{{ file.name }}</span>
        <div>
          <span class="pr-2">{{ filesize(file.size) }}</span>
          <Badge
            :value="badgeProps.value"
            :severity="badgeProps.severity"
          />
        </div>
      </div>
      <div class="ml-auto">
        <Button
          class="p-button-lg p-button-rounded p-button-text"
          @click="removeCallback(index)"
        >
          <font-awesome-icon icon="fa-solid fa-xmark" />
        </Button>
      </div>
    </div>
  </div>
</template>
