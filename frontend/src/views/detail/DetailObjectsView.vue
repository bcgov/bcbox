<script setup lang="ts">
import ObjectFileDetails from '@/components/object/ObjectFileDetails.vue';

// Props
type Props = {
  objId: string
};

const props = withDefaults(defineProps<Props>(), {});
</script>

<template>
  <ObjectFileDetails
    v-if="objId"
    :obj-id="props.objId"
  />
  <div v-else>
    <h3>No object provided</h3>
  </div>
</template>

<style lang="scss" scoped>
h3 {
  font-weight: bold;
}
</style>
