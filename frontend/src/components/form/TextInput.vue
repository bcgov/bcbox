<script setup lang="ts">
import { ref } from 'vue';
import InputText from 'primevue/inputtext';
import { useField, Field, ErrorMessage } from 'vee-validate';

import type { Ref } from 'vue';

const props = defineProps({
  name: { type: String, required: true },
  type: { type: String, default: 'text' },
  rules: { type: null, default: null },
  label: { type: String, default: '' },
  value: { type: String, default: '' }
});

const value: Ref<String> = ref(props.value);

const { errors } = useField(props.name);
</script>

<template>
  <div class="field">
    <Field
      v-slot="{ field }"
      v-model="value"
      :name="name"
      :type="type"
      :rules="rules"
    >
      <label :for="name">{{ label }}</label>
      <InputText
        v-bind="field"
        :type="type"
        :class="errors.length ? 'p-invalid' : ''"
      />
    </Field>
    <ErrorMessage
      :name="name"
      class="p-error"
    />
  </div>
</template>

<style lang="scss" scoped>
.field * {
  display: block;
}
</style>
