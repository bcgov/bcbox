<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, ref, onMounted } from 'vue';

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import ShareLinkContent from '@/components/object/share/ShareLinkContent.vue';
import { Button, Dialog, TabView, TabPanel, RadioButton, InputText, useToast } from '@/lib/primevue';
import { useConfigStore, useObjectStore } from '@/store';

import type { Ref } from 'vue';
import type { COMSObject } from '@/types';

// Props
type Props = {
  bucketId?: string;
  objectId?: string;
  labelText: string;
};
export type inviteFormData = {
  email: string;
  bucketId?: string;
  expiresAt: number;
  objectId?: string;
};

const props = withDefaults(defineProps<Props>(), {
  bucketId: '',
  objectId: '',
  labelText: ''
});

// Store
const objectStore = useObjectStore();
const toast = useToast();

// State
const obj: Ref<COMSObject | undefined> = ref(undefined);

// Share link
const bcBoxLink = computed(() => {
  return `${window.location.origin}/detail/objects?objectId=${props.id}`;
});
const comsUrl = computed(() => {
  return `${getConfig.value.coms?.apiPath}/object/${props.id}`;
});

// Value is set in hours, so 3 days (3x24) = 72hours
const timeFrames: Ref<
  {
    name: string;
    key: string;
  }[]
> = ref([
  { name: '1 Hour', value: 1 },
  { name: '8 Hour', value: 8 },
  { name: '1 Day', value: 24 },
  { name: '1 Week', value: 168 }
]);

const formData: Ref<inviteFormData> = ref({});

// Dialog
const displayInviteDialog = ref(false);

//Action
const sendInvite = () => {
  console.log('test');
  console.log(formData);
  console.log(formData.value.expiresAt);
  // console.log(obj.value.bucketId);
  // console.log(obj.value.bucketId);
  if (props.objectId) {
    formData.value.bucketId = props.bucketId;
  } else if (props.bucketId) {
    formData.value.objectId = props.objectId;
  } else {
    toast.error('', 'Provide either BucketId or ObjectId');
  }

  let expiresAt;
  if (formData.value.expiresAt) {
    expiresAt = Math.floor(
      new Date(new Date().setDate(new Date().getDate() + formData.value.expiresAt)).getTime() / 1000
    );
    // Just for reference
    console.log(new Date(expiresAt * 1000));
  }
  toast.success('', 'Not Provide either BucketId or ObjectId');
  comsUrl = 'https://bcbox-dev-domain/invite/token';
};
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
    <h3 class="mt-1 mb-2">File Access</h3>
    <p>Make file available for</p>
    <div class="flex flex-wrap gap-3">
      <div
        v-for="t in timeFrames"
        :key="t.value.toString()"
        class="flex align-items-center"
      >
        <RadioButton
          v-model="formData.expiresAt"
          :input-id="t.value.toString()"
          :name="t.name"
          :value="t.value"
        />
        <label
          :for="t.value"
          class="ml-2"
        >
          {{ t.name }}
        </label>
      </div>
    </div>
    <h3 class="mt-1 mb-2">Email</h3>
    <label
      class="mb-4"
      for="inviteEmail"
    >
      Invite People
    </label>
    <div class="p-inputgroup mb-4">
      <InputText
        v-model="formData.email"
        name="inviteEmail"
        placeholder="Enter email"
        required
        type="email"
      />
      <Button
        class="p-button p-button-primary"
        @click="sendInvite"
      >
        <font-awesome-icon
          icon="fa fa-envelope"
          class="mr-2"
        />
        Invite
      </Button>
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
