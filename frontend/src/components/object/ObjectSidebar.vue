<script setup lang="ts">
import { RouteNames } from '@/utils/constants';
// PrimeVue
import Button from 'primevue/button';
// Other
import ObjectAccess from './ObjectAccess.vue';
import ObjectTag from './ObjectTag.vue';
import ObjectMetadata from './ObjectMetadata.vue';
import ObjectProperties from './ObjectProperties.vue';

defineProps({
  displayInfo: {
    type: Object,
    default: undefined
  }
});

const emit = defineEmits(['close-info']);

const closeInfo = async () => {
  emit('close-info');
};
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
    <div class="col-fixed align-items-center">
      <Button
        class="p-button-lg p-button-rounded p-button-text black"
        @click="closeInfo"
      >
        <font-awesome-icon icon="fa-solid fa-xmark" />
      </Button>
    </div>
  </div>
  <div class="pl-2">
    <ObjectProperties :object-properties="displayInfo" />
    <ObjectAccess :object-access="displayInfo" />
    <ObjectMetadata :object-metadata="displayInfo?.metadata" />
    <ObjectTag :object-tag="displayInfo?.tag" />
    <div class="col-9">
      <router-link
        v-slot="{ navigate }"
        custom
        :to="{ name: RouteNames.ObjectFileDetails, params: { objId: displayInfo?.id } }"
      >
        <Button
          role="link"
          label="Primary"
          class="p-button-outlined"
          @click="navigate"
        >
          View all details
        </Button>
      </router-link>
    </div>
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

.black {
  color: black;
}

button {
  margin-top: 15px;
}
</style>
