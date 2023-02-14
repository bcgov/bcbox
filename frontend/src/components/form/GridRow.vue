<script setup lang="ts">
defineProps({
  label: {
    type: String,
    default: undefined
  },
  value: {
    type: String,
    default: undefined
  },
  link: {
    type: Object,
    default: undefined
  }
});
</script>

<template>
  <div
    v-if="value && label"
    class="col-3"
  >
    {{ label }}:
  </div>
  <div
    v-if="value && link"
    class="col-9"
  >
    <router-link
      :to="link"
    >
      {{ value }}
    </router-link>
  </div>
  <div
    v-if="value && !link"
    class="col-9"
  >
    {{ value }}
  </div>
</template>
