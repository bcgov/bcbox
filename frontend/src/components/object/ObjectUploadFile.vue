<script setup lang="ts">
import { filesize } from 'filesize';

import { Badge, Button } from '@/lib/primevue';

// Props
type Props = {
  files: Array<any>; // TODO: Change any to more specific type
  badgeProps: any;
  removeCallback: Function;
};

const props = withDefaults(defineProps<Props>(), {});
</script>

<template>
  <div v-if="props.files.length > 0">
    <div
      v-for="(file, index) of props.files"
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
            :value="props.badgeProps.value"
            :severity="props.badgeProps.severity"
          />
        </div>
      </div>
      <div class="ml-auto">
        <Button
          class="p-button-lg p-button-rounded p-button-text"
          @click="props.removeCallback(index)"
        >
          <font-awesome-icon icon="fa-solid fa-xmark" />
        </Button>
      </div>
    </div>
  </div>
</template>
