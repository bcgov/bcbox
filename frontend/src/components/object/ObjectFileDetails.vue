<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useToast } from 'primevue/usetoast';

import ObjectAccess from '@/components/object/ObjectAccess.vue';
import ObjectMetadata from '@/components/object/ObjectMetadata.vue';
import ObjectProperties from '@/components/object/ObjectProperties.vue';
import ObjectTag from '@/components/object/ObjectTag.vue';
import { useObjectStore } from '@/store';

import type { Ref } from 'vue';
import type { COMSObject } from '@/interfaces';

const toast = useToast();
const route = useRoute();

const objectInfo: Ref<COMSObject> = ref({} as COMSObject);
const isInfoLoaded: Ref<Boolean> = ref(false);
const { objectList } = storeToRefs(useObjectStore());

const getObjectInfo = async (objId: string) => {
  try {
    objectInfo.value = (objectList.value.find((x: COMSObject) => x.id === objId) as COMSObject);
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
      <h1 class="pl-1 font-bold">
        File details
      </h1>
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
:deep(.grid) {
  width: 33% !important;
}
</style>
