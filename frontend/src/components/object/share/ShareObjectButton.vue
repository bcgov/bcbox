<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, ref, onMounted } from 'vue';

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { ShareLinkContent } from '@/components/object';
import { Button, Dialog, TabView, TabPanel } from '@/lib/primevue';
import { useConfigStore, useMetadataStore, useObjectStore } from '@/store';

import type { Ref } from 'vue';
import type { COMSObject } from '@/types';

// Props
type Props = {
  id: string;
};

const props = withDefaults(defineProps<Props>(), {});

// Store
const metadataStore = useMetadataStore();
const objectStore = useObjectStore();
const { getConfig } = storeToRefs(useConfigStore());

// State
const obj: Ref<COMSObject | undefined> = ref(undefined);

// Dialog
const displayShareDialog = ref(false);

// Share link
const bcBoxLink = computed(() => {
  return `${window.location.origin}/list/detail/object?objectId=${props.id}`;
});
const comsUrl = computed(() => {
  return `${getConfig.value.coms?.apiPath}/object/${props.id}`;
});

onMounted( () => {
  obj.value = objectStore.findObjectById(props.id);
});
</script>

<template>
  <Dialog
    v-model:visible="displayShareDialog"
    header="Share"
    :modal="true"
    :style="{ minWidth: '700px' }"
    class="bcbox-info-dialog"
  >
    <template #header>
      <font-awesome-icon
        icon="fa-solid fa-share-alt"
        fixed-width
      />
      <span class="p-dialog-title">Share</span>
    </template>

    <h3 class="bcbox-info-dialog-subhead">
      {{ metadataStore.findValue(id, 'name') }}
    </h3>

    <ul class="mb-4">
      <li>
        To share publicly or with a direct file link, you must set the file to
        public in the object list
      </li>
      <li>
        To share to a BCBox user, you must first apply permissions to them
      </li>
    </ul>

    <TabView>
      <TabPanel header="BCBox share link">
        <ShareLinkContent
          :share-link="bcBoxLink"
          label="Share Link"
        />
      </TabPanel>
      <TabPanel
        v-if="obj?.public"
        header="Direct public file link"
      >
        <ShareLinkContent
          :share-link="comsUrl"
          label="Direct Link"
        />
      </TabPanel>
    </TabView>
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
