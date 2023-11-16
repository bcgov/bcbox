<script setup lang="ts">
import { RouteNames } from '@/utils/constants';

import type { BucketTreeNode } from '@/types';

// Props
type Props = {
  node: BucketTreeNode;
};

const props = withDefaults(defineProps<Props>(), {});
</script>

<template>
  <span v-if="(props.node.data as any).dummy">
    {{ props.node.data.bucketName }}
    <span
      v-if="node.isRoot"
      class="bucket-subtext pl-1"
    >
      {{ node.data.bucket }}
    </span>
  </span>
  <span v-else>
    <router-link :to="{ name: RouteNames.LIST_OBJECTS, query: { bucketId: (props.node.data as any).bucketId } }">
      {{ node.data.bucketName }}
    </router-link>
    <span
      v-if="node.isRoot"
      class="bucket-subtext pl-2"
    >
      {{ node.data.bucket }}
    </span>
  </span>
</template>

<style scoped lang="scss">
.bucket-subtext {
  font-size: small;
  color: gray;
  font-style: italic;
}
</style>
