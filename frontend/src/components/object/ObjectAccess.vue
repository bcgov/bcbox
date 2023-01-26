<script setup lang="ts">

defineProps({
  displayInfo: {
    type: Object,
    default: undefined
  }
});

</script>

<template>
  <div class="grid">
    <div class="col-12">
      <h2>Access</h2>
    </div>
    <div class="col-3">
      Managed by:
    </div>
    <div class="col-9">
      {{ displayInfo?.managedBy }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
h2 {
  font-weight: bold;
}
</style>
