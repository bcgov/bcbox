<script setup lang="ts">
import { RouteNames } from '@/utils/constants';
import { getBucketPath, getLastSegment } from '@/utils/utils';

import type { BucketTreeNode } from '@/types';

// Props
type Props = {
  node: BucketTreeNode;
};

const props = withDefaults(defineProps<Props>(), {});
</script>

<template>
  <span v-if="props.node.data.dummy">
    {{ props.node.data.bucketName }}
    <span
      v-if="props.node.data.key === '/'"
      class="pl-2 text-xs"
    >
      {{ props.node.data.bucketName }}
    </span>
    <span
      v-else
      class="pl-2 text-xs"
    >
      {{ '/' + props.node.data.bucketName }}
    </span>
  </span>

  <span v-else>
    <router-link :to="{ name: RouteNames.LIST_OBJECTS, query: { bucketId: props.node.data.bucketId } }">
      {{ props.node.data.bucketName }}
    </router-link>
    <span
      v-if="props.node.data.key === '/'"
      class="pl-2 text-xs"
    >
      {{ getLastSegment(getBucketPath(props.node.data)) }}
    </span>
    <span
      v-else
      class="pl-2 text-xs"
    >
      {{ '/' + getLastSegment(getBucketPath(props.node.data)) }}
    </span>
  </span>
</template>
