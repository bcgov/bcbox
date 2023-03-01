<script setup lang="ts">
import { computed, ref, type PropType } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { storeToRefs } from 'pinia';

import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';

import ShareLinkContent from './ShareLinkContent.vue';
import { useConfigStore } from '@/store';

import type { COMSObject } from '@/interfaces';

const { getConfig } = storeToRefs(useConfigStore());

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
const bcBoxLink = computed(() => {
  return `${window.location.origin}/list/detail/object?objId=${props.obj.id}`;
});
const comsUrl = computed(() => {
  return `${getConfig.value.coms?.apiPath}/object/${props.obj.id}`;
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
        To share publicly or with a direct file link, you must set the file to
        public in the object list
      </li>
      <li>
        To share to a BCBox user, you must first apply permissions to them
      </li>
    </ul>

    <div v-if="props.obj.public">
      <TabView>
        <TabPanel header="BCBox share link">
          <ShareLinkContent
            :share-link="bcBoxLink"
            label="Share Link"
          />
        </TabPanel>
        <TabPanel header="Direct public file link">
          <ShareLinkContent
            :share-link="comsUrl"
            label="Direct Link"
          />
        </TabPanel>
      </TabView>
    </div>
    <div v-else>
      <ShareLinkContent
        :share-link="bcBoxLink"
        label="Share Link"
      />
    </div>
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
