<script setup lang="ts">
import { onMounted, ref, Ref } from 'vue';
import { useRoute } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useObjectStore } from '@/store';
import ObjectAccess from './ObjectAccess.vue';
import ObjectTag from './ObjectTag.vue';
import ObjectMetadata from './ObjectMetadata.vue';
import ObjectProperties from './ObjectProperties.vue';
import type { COMSObject } from '@/interfaces';

const toast = useToast();
const route = useRoute();

const objectStore = useObjectStore();
const objectInfo: Ref<COMSObject> = ref({} as COMSObject);
const isInfoLoaded: Ref<Boolean> = ref(false);

const getObjectInfo = async (objId: string) => {
  try {
    await objectStore.listObjects({ objId });
    objectInfo.value = (objectStore.getObjectInfo(objId) as COMSObject);
    isInfoLoaded.value = true;
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Unable to load Objects.', detail: error, life: 5000 });
  }
};

onMounted(() => {
  getObjectInfo(route.query.objId as string);
});
</script>

<template>
  <div class="flex justify-content-start">
    <div class="flex col align-items-center pl-0">
      <font-awesome-icon
        icon="fa-solid fa-circle-info"
        style="font-size: 2rem"
      />
      <h1>File details</h1>
    </div>
  </div>
  <div
    v-if="isInfoLoaded"
    class="pl-2"
  >
    <ObjectProperties :object-properties="objectInfo" />
    <ObjectAccess :object-access="objectInfo" />
    <ObjectMetadata :object-metadata="objectInfo.metadata" />
    <ObjectTag :object-tag="objectInfo.tag" />
  </div>
</template>

<style lang="scss" scoped>
h1 {
  padding-left: 1rem;
  font-weight: bold;
}

h2 {
  font-weight: bold;
}
</style>
