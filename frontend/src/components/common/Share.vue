<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import QrcodeVue from 'qrcode.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { Button, InputText, useToast } from '@/lib/primevue';
import { useConfigStore } from '@/store';

import type { Ref } from 'vue';

// Props
type Props = {
  label: string;
  inviteLink?: string;
  resourceType: string;
  resource: any;
};
const props = withDefaults(defineProps<Props>(), {
  inviteLink: undefined
});

// store
const { getConfig } = storeToRefs(useConfigStore());

// TODO: public folders
// Share link
const shareLink: Ref<string> = computed(() => {
  if (props.inviteLink)
    return props.inviteLink; // use invite link if defined in prop
  else if (props.resource.public && props.resourceType === 'object') {
    return `${getConfig.value.coms?.apiPath}/object/${props.resource.id}`;
  } else {
    // else either a bucket or protected file
    const path =
      props.resourceType === 'object'
        ? `detail/objects?objectId=${props.resource.id}`
        : `list/objects?bucketId=${props.resource.bucketId}`;
    return `${window.location.origin}/${path}`;
  }
});

// Actions
const toast = useToast();
const copyLinkToClipboard = () => {
  navigator.clipboard.writeText(shareLink.value);
  toast.info('Share link copied to clipboard');
};
</script>

<template>
  <label for="shareLink">{{ props.label }}</label>
  <div class="p-inputgroup mb-4">
    <InputText
      name="shareLink"
      readonly
      :value="shareLink"
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
    :value="shareLink"
    :size="250"
    level="L"
  />
</template>
