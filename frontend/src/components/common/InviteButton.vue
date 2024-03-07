<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, ref, onMounted } from 'vue';

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import ShareLinkContent from '@/components/object/share/ShareLinkContent.vue';
import { Button, Dialog, TabView, TabPanel, RadioButton, InputText, useToast, InputSwitch } from '@/lib/primevue';
import { useConfigStore, useObjectStore } from '@/store';
import { permissionService } from '@/services';

import type { Ref } from 'vue';
import type { COMSObject } from '@/types';

// Props
type Props = {
  bucketId?: string;
  objectId?: string;
  labelText: string;
  restricted?: boolean;
};
export type inviteFormData = {
  email?: string;
  bucketId?: string;
  expiresAt?: number;
  objectId?: string;
};

const props = withDefaults(defineProps<Props>(), {
  bucketId: '',
  objectId: '',
  labelText: '',
  isRestricted: false
});

// Store
const objectStore = useObjectStore();
const { getConfig } = storeToRefs(useConfigStore());
const toast = useToast();

// State
const obj: Ref<COMSObject | undefined> = ref(undefined);
const isRestricted: Ref<boolean> = ref(props.restricted);
const showInviteLink: Ref<boolean> = ref(false);

// Share link
const inviteLink: Ref<string> = ref('');

// Value is set in hours, so 3 days (3x24) = 72hours
const timeFrames: Ref<
  {
    name: string;
    value: number;
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

// Share link
const bcBoxLink = computed(() => {
  const path = props.objectId ? `detail/objects?objectId=${props.objectId}` : `list/objects?bucketId=${props.bucketId}`;
  return `${window.location.origin}/${path}`;
});
const comsUrl = computed(() => {
  return `${getConfig.value.coms?.apiPath}/object/${props.objectId}`;
});

//Action
async function sendInvite() {
  try {
    let expiresAt;
    if (formData.value.expiresAt) {
      expiresAt = Math.floor(
        new Date(new Date().setDate(new Date().getDate() + formData.value.expiresAt)).getTime() / 1000
      );
      // Just for reference
      console.log(new Date(expiresAt * 1000));
    }
    const permissionToken = await permissionService.createInvite(
      props.bucketId,
      formData.value.email,
      expiresAt,
      props.objectId
    );
    inviteLink.value = `${getConfig.value.coms?.apiPath}/permission/invite/${permissionToken.data}`;
    console.log(permissionToken);
    toast.success('', 'Not Provide either BucketId or ObjectId');
    showInviteLink.value = true;
  } catch (error: any) {
    toast.error('', 'Error getting token');
  }
}
onMounted(() => {
  obj.value = objectStore.findObjectById(props.objectId);
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
        icon="fa-solid fa-share-alt"
        fixed-width
      />
      <span class="p-dialog-title">Share</span>
    </template>

    <h3 class="bcbox-info-dialog-subhead">
      {{ obj?.name }}
    </h3>

    <ul class="mb-4">
      <li>Invite someone using an invite link</li>
      <li>If a user already has permissions, you can link them with a share link</li>
      <li>To share publicly or with a direct link, you must set the file to public - this only works for objects</li>
    </ul>
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
        header="Share link"
        :disabled="obj?.public"
      >
        <ShareLinkContent
          :share-link="bcBoxLink"
          label="Share Link"
        />
      </TabPanel>
      <TabPanel header="Invite link">
        <h3 class="mt-1 mb-2">File Access</h3>
        <p>Make available for:</p>
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
              :for="t.value.toString()"
              class="ml-2"
            >
              {{ t.name }}
            </label>
          </div>
        </div>
        <p class="mt-4 mb-2">Restrict to user's email</p>
        <InputSwitch
          class="mt-5"
          v-model="isRestricted"
        />
        <InputText
          v-show="isRestricted"
          v-model="formData.email"
          class="ml-7 mb-4"
          name="inviteEmail"
          placeholder="Enter email"
          required
          type="email"
        />
        <div class="p-inputgroup mb-4">
          <Button
            class="p-button p-button-primary"
            @click="sendInvite"
          >
            <font-awesome-icon
              icon="fa fa-envelope"
              class="mr-2"
            />
            Generate invite link
          </Button>
        </div>

        <ShareLinkContent
          v-if="showInviteLink"
          :share-link="inviteLink"
          label="Invite Link"
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
