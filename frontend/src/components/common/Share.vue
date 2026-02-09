<script setup lang="ts">
import { computed } from 'vue';
import QrcodeVue from 'qrcode.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { Button, InputText, useToast } from '@/lib/primevue';

// Props
type Props = {
  linkType: string;
  shareLink: string;
};
const props = withDefaults(defineProps<Props>(), {
  shareLink: undefined
});

const text = computed(() => {
  switch (props.linkType) {
    case 'public-file':
      return '<strong>Anyone</strong> with this link can download this file without authentication.';
    case 'share-file':
      return 'Only people who have permissions can access this file in BCBox.';
    case 'share-public-folder':
      return '<strong>Anyone</strong> with this link can view the contents of \
      this folder in BCBox without authentication.';
    case 'share-folder':
      return 'Only people who have permissions can access this folder in BCBox.';
    default:
      return 'Share link';
  }
});

// Actions
const toast = useToast();
const copyLinkToClipboard = () => {
  navigator.clipboard.writeText(props.shareLink);
  toast.info('Share link copied to clipboard');
};
</script>

<template>
  <h3 class="mb-2">Share link</h3>
  <!-- eslint-disable vue/no-v-html -->
  <label
    class="mb-4 block"
    for="shareLink"
    v-html="text"
  />
  <!-- eslint-enable vue/no-v-html -->
  <div class="p-inputgroup mt-2 mb-4">
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
    :size="150"
    level="L"
  />
</template>
