<script setup lang="ts">

import { DeletedObjectList } from '@/components/object';

</script>

<template>
  <div>
    <h2
      class="mb-1 flex overflow-hidden"
    >
      <font-awesome-icon
        icon="fa-solid fa-trash"
        class="mr-2 mt-2"
      />
      <span class="wrap-block w-11">Recycle Bin</span>
    </h2>
    <p>Select a deleted file to restore, or permanently delete it.</p>
    <DeletedObjectList />
  </div>
</template>

<style scoped lang="scss">
h2 svg {
  color: $bcbox-primary;
}
</style>
