<script setup lang="ts">
import { computed, ref, type PropType } from "vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import { useToast } from "primevue/usetoast";

import type { COMSObject } from "@/interfaces";

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
  return `${window.location.origin}/list/detail/object?objId=${props.obj.id}`;
});
const copyLinkToClipboard = () => {
  navigator.clipboard.writeText(shareLink.value);
  toast.add({
    severity: "info",
    summary: "Share Link copied to clipboard",
    life: 3000,
  });
};
</script>

<template>
  <Dialog v-model:visible="displayShareDialog" header="Share" :modal="true">
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

    <label for="shareLink">Share Link</label>
    <div class="p-inputgroup">
      <InputText name="shareLink" readonly :value="shareLink" />
      <Button
        class="p-button-outlined p-button-secondary"
        @click="copyLinkToClipboard"
      >
        <font-awesome-icon icon="fa fa-clipboard" class="mr-2" /> Copy Link
      </Button>
    </div>
    <pre>{{ props.obj }}</pre>
  </Dialog>

  <Button class="p-button-lg p-button-text" @click="displayShareDialog = true">
    <font-awesome-icon icon="fa-solid fa-share-alt" />
  </Button>
</template>
