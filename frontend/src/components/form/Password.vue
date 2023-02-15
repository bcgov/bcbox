<script setup lang="ts">
import { toRef } from 'vue';
import Password from 'primevue/password';
import { useField, ErrorMessage } from 'vee-validate';

const props = defineProps({
  name: { type: String, required: true },
  type: { type: String, default: 'text' },
  label: { type: String, default: '' },
  placeholder: { type: String, default: '' },
});

const { errorMessage, value } = useField<string>(toRef(props, 'name'));
</script>

<template>
  <div class="field">
    <label :for="name">{{ label }}</label>
    <Password
      v-model="value"
      :aria-describedby="`${name}-help`"
      :name="name"
      :type="type"
      :placeholder="placeholder"
      :class="{ 'p-invalid': errorMessage }"
      :feedback="false"
      toggle-mask
    />
    <ErrorMessage
      :name="name"
    />
  </div>
</template>

<style lang="scss" scoped>
.field * {
  display: block;
}
</style>
