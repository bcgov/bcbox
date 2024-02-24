<script setup lang="ts">
import { RequirePublicOrAuth } from '@/components/guards';
import { ObjectFileDetails } from '@/components/object';

// Props
type Props = {
  objectId: string;
  versionId?: string;
};

const props = withDefaults(defineProps<Props>(), {
  versionId: undefined
});
</script>

<template>
  <RequirePublicOrAuth :object-id="props.objectId">
    <ObjectFileDetails
      v-if="props.objectId"
      :object-id="props.objectId"
      :version-id="props.versionId"
    />
    <div v-else>
      <h3 class="font-bold">No object or version provided</h3>
    </div>
  </RequirePublicOrAuth>
</template>
