<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onBeforeMount, ref } from 'vue';
import { useRouter } from 'vue-router';

import { useAuthStore, useObjectStore } from '@/store';
import { RouteNames } from '@/utils/constants';

import type { Ref } from 'vue';

// Props
type Props = {
  objectId: string
};

const props = withDefaults(defineProps<Props>(), {});

// Store
const objectStore = useObjectStore();
const { getIsAuthenticated } = storeToRefs(useAuthStore());

// State
const ready: Ref<boolean> = ref(false);

// Actions
const router = useRouter();

onBeforeMount( async () => {
  let isPublic = false;
  if( props.objectId ) {
    const head = await objectStore.headObject(props.objectId);
    isPublic = head?.status === 204;
  }

  if( !isPublic && !getIsAuthenticated.value ) {
    router.push({ name: RouteNames.LOGIN });
  }
  else {
    ready.value = true;
  }
});
</script>

<template>
  <slot v-if="ready" />
</template>

<style lang="scss" scoped>
h3 {
  font-weight: bold;
}
</style>
