<script setup lang="ts">
import { computed, ref, type PropType } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { storeToRefs } from 'pinia';

import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputSwitch from 'primevue/inputswitch';
import InputText from 'primevue/inputtext';

import QrcodeVue from 'qrcode.vue';
import { useConfigStore } from '@/store';
import { useToast } from 'primevue/usetoast';

import type { COMSObject } from '@/interfaces';

const { config } = storeToRefs(useConfigStore());

const toast = useToast();

// Props
const props = defineProps({
  obj: {
    type: Object as PropType<COMSObject>,
    required: true,
  },
});

// Dialog
const displayShareDialog = ref(false);

// Share link
const shareLink = computed(() => {
  return useExternalLink.value
    ? comsUrl.value
    : `${window.location.origin}/list/detail/object?objId=${props.obj.id}`;
});
const copyLinkToClipboard = () => {
  navigator.clipboard.writeText(shareLink.value);
  toast.add({
    severity: 'info',
    summary: 'Share Link copied to clipboard',
    life: 3000,
  });
};

// Public external
const useExternalLink = ref(false);
const comsUrl = computed(() => {
  return `${config.value.coms?.apiPath}/object/${props.obj.id}`;
});
</script>

<template>
  <Dialog
    v-model:visible="displayShareDialog"
    header="Share"
    :modal="true"
    :style="{ minWidth: '700px' }"
  >
    <template #header>
      <div class="flex">
        <font-awesome-icon
          icon="fa-solid fa-share-alt"
          class="pr-3 pt-2"
          style="font-size: 2rem"
        />
        <div>
          <h1>Share</h1>
          <h3>{{ props.obj.name }}</h3>
        </div>
      </div>
    </template>
    <h2>Share</h2>
    <ul class="mb-4">
      <li>
        To share publicly, you must set the file to public in the object list
      </li>
      <li>
        To share to a BCBox user, you must first apply permissions to them
      </li>
    </ul>

    {{ config.coms.apiPath }}

    <div v-if="props.obj.public">
      <h4>Generate External (non-BCBox) public link</h4>
      <InputSwitch
        v-model="useExternalLink"
        class="mb-4"
      />
    </div>

    <label for="shareLink">Share Link</label>
    <div class="p-inputgroup mb-4">
      <InputText
        name="shareLink"
        readonly
        :value="shareLink"
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
  </Dialog>

  <Button
    class="p-button-lg p-button-text"
    @click="displayShareDialog = true"
  >
    <font-awesome-icon icon="fa-solid fa-share-alt" />
  </Button>
</template>

<style scoped lang="scss">
h2 {
  font-weight: bold;
}
ul {
  padding-left: 22px;
}
</style>
