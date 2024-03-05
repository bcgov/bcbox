<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, ref, onMounted } from 'vue';

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import ShareLinkContent from '@/components/object/share/ShareLinkContent.vue';
import { Button, Dialog, TabView, TabPanel, RadioButton } from '@/lib/primevue';
import { useConfigStore, useObjectStore } from '@/store';

import type { Ref } from 'vue';
import type { COMSObject } from '@/types';

// Props
type Props = {
  id: string;
  labelText: string;
};

const props = withDefaults(defineProps<Props>(), {});

// Store
const objectStore = useObjectStore();
const { getConfig } = storeToRefs(useConfigStore());

// State
const obj: Ref<COMSObject | undefined> = ref(undefined);

const timeFrames: Ref<
  {
    name: string;
    key: string;
  }[]
> = ref([
  { name: 'No Limit', key: '0' },
  { name: '1 Day', key: '1' },
  { name: '3 Day', key: '3' },
  { name: '7 Day', key: '7' }
]);

// Dialog
const displayInviteDialog = ref(false);

// Share link
const bcBoxLink = computed(() => {
  return `${window.location.origin}/detail/objects?objectId=${props.id}`;
});
const comsUrl = computed(() => {
  return `${getConfig.value.coms?.apiPath}/object/${props.id}`;
});

onMounted(() => {
  obj.value = objectStore.findObjectById(props.id);
});
</script>

<template>
  <Dialog
    v-model:visible="displayInviteDialog"
    header="Share"
    :modal="true"
    :style="{ minWidth: '700px' }"
    class="bcbox-info-dialog"
  >
    <template #header>
      <font-awesome-icon
        icon="fa-solid fa-share"
        fixed-width
      />
      <span class="p-dialog-title">Invite</span>
    </template>

    <h3 class="bcbox-info-dialog-subhead">
      {{ obj?.name }}
    </h3>

    <ul class="mb-4">
      <li>To share you must first add email and send an invite to the user.</li>
    </ul>
    <div class="flex flex-wrap gap-3">
      <div
        v-for="t in timeFrames"
        :key="t.key"
        class="flex align-items-center"
      >
        <RadioButton
          :input-id="t.key"
          name="dynamic"
          :value="t.name"
        />
        <label
          :for="t.key"
          class="ml-2"
        >
          {{ t.name }}
        </label>
      </div>
    </div>
    <TabView>
      <TabPanel
        v-if="obj?.public"
        header="Direct public file link"
      >
        <ShareLinkContent
          :share-link="comsUrl"
          label="Direct Link"
        />
      </TabPanel>
      <!-- Disable for public until unauthed File Details page works -->
      <TabPanel
        header="BCBox share link"
        :disabled="obj?.public"
      >
        <ShareLinkContent
          :share-link="bcBoxLink"
          label="Share Link"
        />
      </TabPanel>
    </TabView>
  </Dialog>

  <Button
    v-tooltip.bottom="props.labelText"
    class="p-button-lg p-button-text primary"
    aria-label="props.labelText"
    @click="displayInviteDialog = true"
  >
    <font-awesome-icon icon="fa-solid fa-share" />
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
