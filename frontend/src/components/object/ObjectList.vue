<template>
  <div>List of Objects:</div>

  {{ objectList }}
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useObjectStore } from '@/store/objectStore';
const { objectList } = storeToRefs(useObjectStore());

const objectStore = useObjectStore();

// Get the user's list of objects
await objectStore.listObjects();
</script>

<style scoped></style>
