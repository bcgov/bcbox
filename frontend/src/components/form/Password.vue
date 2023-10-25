<script setup lang="ts">
import { toRef } from 'vue';
import { useField, ErrorMessage } from 'vee-validate';

import { Password } from '@/lib/primevue';

type Props = {
  helptext?: string;
  label?: string;
  name: string;
  placeholder?: string;
  type?: string;
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
    <label :for="props.name">{{ props.label }}</label>
    <Password
      v-model.trim="value"
      :aria-describedby="`${props.name}-help`"
      :name="props.name"
      :type="props.type"
      :placeholder="props.placeholder"
      :class="{ 'p-invalid': errorMessage }"
      :feedback="false"
      toggle-mask
    />
    <small :id="`${name}-help`">{{ helptext }}</small>
    <ErrorMessage :name="props.name" />
  </div>
</template>

<style lang="scss" scoped>
.field * {
  display: block;
}
</style>
