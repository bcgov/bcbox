<script setup lang="ts">
import { toRef } from 'vue';
import { useField, ErrorMessage } from 'vee-validate';

import { InputText } from '@/lib/primevue';

// Props
type Props = {
  helptext?: string;
  label?: string;
  name: string;
  placeholder?: string;
};

const props = withDefaults(defineProps<Props>(), {
  helptext: '',
  type: 'text',
  label: '',
  placeholder: ''
});

const { errorMessage, value } = useField<string>(toRef(props, 'name'));
</script>

<template>
  <div class="field">
    <label :for="name">{{ label }}</label>
    <InputText
      v-model="value"
      :aria-describedby="`${name}-help`"
      :name="name"
      :placeholder="placeholder"
      :class="{ 'p-invalid': errorMessage }"
    />
    <small id="`${name}-help`">{{ helptext }}</small>
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
