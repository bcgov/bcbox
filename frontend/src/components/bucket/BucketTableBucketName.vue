<script setup lang="ts">
import { RouteNames } from '@/utils/constants';
import { getBucketPath } from '@/utils/utils';

import type { BucketTreeNode } from '@/types';

// Props
type Props = {
  node: BucketTreeNode;
};

const props = withDefaults(defineProps<Props>(), {});
</script>

<template>
  <span
    v-if="props.node.data.dummy"
    class="opacity-70"
  >
    <font-awesome-icon
      icon="fa-solid fa-folder"
      class="mr-2"
    />
    {{ props.node.data.bucketName }}
  </span>
  <span
    v-else
    v-tooltip.bottom="'path: /' + getBucketPath(node.data, true).replace('//', '')"
  >
    <font-awesome-icon
      icon="fa-solid fa-folder"
      class="mr-2"
    />
    <router-link :to="{ name: RouteNames.LIST_OBJECTS, query: { bucketId: props.node.data.bucketId } }">
      {{ props.node.data.bucketName }}
    </router-link>
  </span>
</template>
