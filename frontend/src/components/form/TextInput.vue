<script setup lang="ts">
import { toRef } from 'vue';
import InputText from 'primevue/inputtext';
import { useField, ErrorMessage } from 'vee-validate';

// Props
type Props = {
  name: string;
  label?: string;
  placeholder?: string;
};

const props = withDefaults(defineProps<Props>(), {
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
