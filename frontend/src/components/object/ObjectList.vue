<script setup lang="ts">
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useObjectStore } from '@/store/objectStore';
const { objectList } = storeToRefs(useObjectStore());

const objectStore = useObjectStore();

// Get the user's list of objects
onMounted(() => {
  objectStore.listObjects();
});
</script>

<template>
  <div>List of Objects:</div>

  {{ objectList }}
</template>

<style scoped></style>
