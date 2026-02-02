<script setup lang="ts">
import QrcodeVue from 'qrcode.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { Button, InputText, useToast } from '@/lib/primevue';

// Props
type Props = {
  label: string;
  shareLink: string;
};
const props = withDefaults(defineProps<Props>(), {
  shareLink: undefined
});

// Actions
const toast = useToast();
const copyLinkToClipboard = () => {
  navigator.clipboard.writeText(props.shareLink);
  toast.info('Share link copied to clipboard');
};
</script>

<template>
  <!-- <label for="shareLink">{{ props.label }}:</label> -->
  <div class="p-inputgroup my-4">
    <InputText
      name="shareLink"
      readonly
      :value="props.shareLink"
    />
    <Button
      class="p-button-outlined p-button-primary"
      @click="copyLinkToClipboard"
    >
      <font-awesome-icon
        icon="fa fa-clipboard"
        class="mr-2"
      />
      Copy Link
    </Button>
  </div>

  <label class="block">QR code</label>
  <qrcode-vue
    :value="props.shareLink"
    :size="250"
    level="L"
  />
</template>
