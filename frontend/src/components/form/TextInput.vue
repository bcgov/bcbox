<script setup lang="ts">
import { toRef } from 'vue';
import { useField, ErrorMessage } from 'vee-validate';

import { InputText } from '@/lib/primevue';

// Props
type Props = {
  helpText?: string;
  label?: string;
  name: string;
  placeholder?: string;
  disabled?: boolean;
};

const props = withDefaults(defineProps<Props>(), {
  helpText: '',
  type: 'text',
  label: '',
  placeholder: '',
  disabled: false
});

const { errorMessage, value } = useField<string>(toRef(props, 'name'));
</script>

<template>
  <div class="field">
    <label :for="name">{{ label }}</label>
    <InputText
      v-model.trim="value"
      :aria-describedby="`${name}-help`"
      :name="name"
      :placeholder="placeholder"
      :class="{ 'p-invalid': errorMessage }"
      :disabled="disabled"
    />
    <small :id="`${name}-help`">{{ helpText }}</small>
    <ErrorMessage :name="name" />
  </div>
</template>

<style lang="scss" scoped>
.field * {
  display: block;
}
</style>
