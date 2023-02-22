<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import QrcodeVue from 'qrcode.vue';
import { useToast } from 'primevue/usetoast';

const toast = useToast();

// Props
const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  shareLink: {
    type: String,
    required: true,
  },
});

const copyLinkToClipboard = () => {
  navigator.clipboard.writeText(props.shareLink);
  toast.add({
    severity: 'info',
    summary: 'Share Link copied to clipboard',
    life: 3000,
  });
};
</script>

<template>
  <label for="shareLink">{{ props.label }}</label>
  <div class="p-inputgroup mb-4">
    <InputText
      name="shareLink"
      readonly
      :value="props.shareLink"
    />
    <Button
      class="p-button-outlined p-button-secondary"
      @click="copyLinkToClipboard"
    >
      <font-awesome-icon
        icon="fa fa-clipboard"
        class="mr-2"
      /> Copy Link
    </Button>
  </div>

  <h2 class="mb-2">
    QR Code
  </h2>
  <qrcode-vue
    :value="shareLink"
    :size="250"
    level="L"
  />
</template>

<style scoped lang="scss">
h2 {
  font-weight: bold;
}
</style>
