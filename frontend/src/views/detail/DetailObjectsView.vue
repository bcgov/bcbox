<script setup lang="ts">
import { RequirePublicOrAuth } from '@/components/guards';
import { ObjectFileDetails } from '@/components/object';

// Props
type Props = {
  objectId: string
};

const props = withDefaults(defineProps<Props>(), {});

</script>

<template>
  <RequirePublicOrAuth :object-id="props.objectId">
    <ObjectFileDetails
      v-if="objectId"
      :object-id="props.objectId"
    />
    <div v-else>
      <h3>No object provided</h3>
    </div>
  </RequirePublicOrAuth>
</template>

<style lang="scss" scoped>
h3 {
  font-weight: bold;
}
</style>
