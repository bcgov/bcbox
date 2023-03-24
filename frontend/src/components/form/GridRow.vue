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
  <div class="col-12">
    <div class="grid">
      <div
        v-if="props.value && props.label"
        class="col-fixed"
      >
        {{ label }}:
      </div>
      <div
        v-if="props.value && props.link"
        class="col wrap-block w-9"
      >
        <router-link :to="props.link">
          {{ props.value }}
        </router-link>
      </div>
      <div
        v-if="props.value && !props.link"
        class="col wrap-block w-9"
      >
        {{ props.value }}
      </div>
    </div>
  </div>
</template>
