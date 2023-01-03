<script lang="ts">
export default {
  props: {
    name: { type: String, required: true },
    type: { type: String, default: 'text' },
    rules: { type: null,  default: null },
    label: { type: String, default: '' },
  },
};
</script>

<script setup lang="ts">
import InputText from 'primevue/inputtext';
import { Field, ErrorMessage } from 'vee-validate';
</script>

<template>
  <div class="field">
    <Field
      v-slot="{ field }"
      :name="name"
      :type="type"
      :rules="rules"
    >
      <label :for="name">{{ label }}</label>
      <InputText
        v-bind="field"
        :type="type"
      />
    </Field>
    <ErrorMessage :name="name" />
  </div>
</template>

<style lang="scss" scoped>
.field * {
  display: block;
}
</style>
