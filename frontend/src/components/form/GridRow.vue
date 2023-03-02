<script setup lang="ts">
type Props = {
  label?: string;
  value?: string;
  link?: object;
};

const props = withDefaults(defineProps<Props>(), {
  label: undefined,
  value: undefined,
  link: undefined
});
</script>

<template>
  <div
    v-if="props.value && props.label"
    class="col-3"
  >
    {{ label }}:
  </div>
  <div
    v-if="props.value && props.link"
    class="col-9"
  >
    <router-link
      :to="props.link"
    >
      {{ props.value }}
    </router-link>
  </div>
  <div
    v-if="props.value && !props.link"
    class="col-9"
  >
    {{ props.value }}
  </div>
</template>
