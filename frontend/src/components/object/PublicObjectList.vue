<script setup lang="ts">
import { ref } from 'vue';

import {
  PublicObjectTable,
} from '@/components/object';

import type { Ref } from 'vue';

// Props
type Props = {
  bucketId?: string;
};

const props = withDefaults(defineProps<Props>(), {
  bucketId: undefined
});


// State
const objectTableKey = ref(0);


</script>

<template>
  <div>
    <div
      class="flex mt-4"
    >
      <div class="flex-grow-1">
        <PublicObjectTable
          :key="objectTableKey"
          :bucket-id="props.bucketId"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
