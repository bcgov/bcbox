<script setup lang="ts">

import { DeletedObjectList } from '@/components/object';

</script>

<template>
  <div>
    <div class="flex col align-items-center heading pl-0">
      <span class="material-icons-outlined icon-large pr-2">delete</span>
      <h2 class="">Recycle Bin</h2>
    </div>
    <p>Select a deleted file to restore, or permanently delete it.</p>
    <DeletedObjectList />
  </div>
</template>

<style scoped lang="scss">
h2 svg {
  color: $bcbox-primary;
}
</style>
