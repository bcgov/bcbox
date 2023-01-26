<script setup lang="ts">
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
  <div class="pl-2">
    <ObjectProperties :display-info="displayInfo" />
    <ObjectAccess :display-info="displayInfo" />
    <ObjectMetadata :object-metadata="displayInfo?.metadata" />
    <ObjectTag :object-tag="displayInfo?.tag" />
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
