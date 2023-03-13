<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onBeforeMount, ref } from 'vue';
import { useRouter } from 'vue-router';

import { useAuthStore } from '@/store';
import { RouteNames } from '@/utils/constants';

import type { Ref } from 'vue';

// Store
const { getIsAuthenticated } = storeToRefs(useAuthStore());

// State
const ready: Ref<boolean> = ref(false);

// Actions
onBeforeMount( async () => {
  const router = useRouter();

  if( !getIsAuthenticated.value ) {
    router.replace({ name: RouteNames.LOGIN });
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
