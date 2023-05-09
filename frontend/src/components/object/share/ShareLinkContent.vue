<script setup lang="ts">
import QrcodeVue from 'qrcode.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

import { Button, InputText, useToast } from '@/lib/primevue';

const toast = useToast();

// Props
type Props = {
  label: string;
  shareLink: string;
};

const props = withDefaults(defineProps<Props>(), {});

// Actions
const copyLinkToClipboard = () => {
  navigator.clipboard.writeText(props.shareLink);
  toast.info('Share link copied to clipboard');
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
