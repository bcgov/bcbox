<script setup lang="ts">
import { Dialog } from '@/lib/primevue';
// Props
type Props = {
  results: Array<Object>;
  resource: any;
  resourceType: string;
};
const props = withDefaults(defineProps<Props>(), {});

const modelValue = defineModel<boolean>({ default: false });
</script>
<template>
  <Dialog
    v-model:visible="modelValue"
    header="Results"
    :modal="true"
  >
    <pre>{{ props.results }}</pre>
  </Dialog>
</template>
