<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, ref, onMounted, watch } from 'vue';

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import ShareLinkContent from '@/components/object/share/ShareLinkContent.vue';
import {
  Button,
  Dialog,
  TabView,
  TabPanel,
  RadioButton,
  Checkbox,
  InputText,
  useToast,
  InputSwitch
} from '@/lib/primevue';
import { Permissions } from '@/utils/constants';
import { inviteService } from '@/services';
import { useAuthStore, useConfigStore, useObjectStore, usePermissionStore, useBucketStore } from '@/store';

import type { Ref } from 'vue';
import type { COMSObject, Bucket } from '@/types';

// Props
type Props = {
  bucketId?: string;
  objectId?: string;
  labelText: string;
  restricted?: boolean;
};
export type InviteFormData = {
  email?: string;
  bucketId?: string;
  expiresAt?: number;
  objectId?: string;
  permCodes?: Array<string>;
};

const props = withDefaults(defineProps<Props>(), {
  bucketId: '',
  objectId: '',
  labelText: '',
  isRestricted: false
});

// Store
const objectStore = useObjectStore();
const bucketStore = useBucketStore();
const { getConfig } = storeToRefs(useConfigStore());
const { getUserId } = storeToRefs(useAuthStore());
const permissionStore = usePermissionStore();

const toast = useToast();

// State
const obj: Ref<COMSObject | undefined> = ref(undefined);
const bucket: Ref<Bucket | undefined> = ref(undefined);
const isRestricted: Ref<boolean> = ref(props.restricted);
const showInviteLink: Ref<boolean> = ref(false);
const hasManagePermission: Ref<boolean> = computed(() => {
  return props.objectId
    ? permissionStore.isObjectActionAllowed(props.objectId, getUserId.value, Permissions.MANAGE, obj.value?.bucketId)
    : permissionStore.isBucketActionAllowed(props.bucketId, getUserId.value, Permissions.MANAGE);
});
const resource = props.objectId ? 'object' : 'bucket';

// Share link
const inviteLink: Ref<string> = ref('');

const timeFrames: Record<string, number> = {
  '1 Hour': 3600,
  '8 Hour': 28800,
  '1 Day (Default)': 86400,
  '1 Week': 604800
};

const bucketPermCodes: Record<string, string> = {
  READ: 'Read',
  CREATE: 'Upload',
  UPDATE: 'Update'
};

const objectPermCodes: Record<string, string> = {
  READ: 'Read',
  UPDATE: 'Update'
};

const formData: Ref<InviteFormData> = ref({ expiresAt: 86400, permCodes: ['READ'] });

// Dialog
const displayInviteDialog = ref(false);

// Permissions selection
const selectedOptions = computed(() => {
  return resource === 'bucket' ? bucketPermCodes : objectPermCodes;
});
// Share link
const bcBoxLink = computed(() => {
  const path = props.objectId ? `detail/objects?objectId=${props.objectId}` : `list/objects?bucketId=${props.bucketId}`;
  return `${window.location.origin}/${path}`;
});
const comsUrl = computed(() => {
  return `${getConfig.value.coms?.apiPath}/object/${props.objectId}`;
});

const isOptionUnselectable = (optionName: string) => {
  // Make default permission disabled
  return optionName === 'Read';
};

watch(isRestricted, () => {
  if (formData.value.email) {
    formData.value.email = '';
  }
});

//Action
async function sendInvite() {
  try {
    let expiresAt;
    if (formData.value.expiresAt) {
      expiresAt = Math.floor(Date.now() / 1000) + formData.value.expiresAt;
    }
    const permissionToken = await inviteService.createInvite(
      props.bucketId,
      formData.value.email,
      expiresAt,
      props.objectId,
      formData.value.permCodes
    );
    inviteLink.value = `${window.location.origin}/invite/${permissionToken.data}`;
    toast.success('', 'Invite link is created.');
    showInviteLink.value = true;
  } catch (error: any) {
    toast.error('', 'Error getting token');
  }
}

onMounted(() => {
  if (props.objectId) {
    obj.value = objectStore.getObject(props.objectId);
  } else if (props.bucketId) {
    bucket.value = bucketStore.getBucket(props.bucketId);
  }
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
      {{ obj?.name || bucket?.bucketName }}
    </h3>

    <ul class="mb-4">
      <li>If a user already has permissions, you can link them with a share link</li>
      <li>
        Invite someone using an invite link - the links are single-use; you must generate a new link for each user you
        intend to send this to
      </li>
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
      <TabPanel
        header="Invite link"
        :disabled="!hasManagePermission"
      >
        <h3 class="mt-1 mb-2">{{ props.labelText }} Invite</h3>
        <p>Make invite available for</p>
        <div class="flex flex-wrap gap-3">
          <div
            v-for="(value, name) in timeFrames"
            :key="value"
            class="flex align-items-center"
          >
            <RadioButton
              v-model="formData.expiresAt"
              :input-id="value.toString()"
              :name="name"
              :value="value"
            />
            <label
              :for="value.toString()"
              class="ml-2"
            >
              {{ name }}
            </label>
          </div>
        </div>
        <p class="mt-4 mb-2">Access options</p>
        <div class="flex flex-wrap gap-3">
          <div
            v-for="(name, value) in selectedOptions"
            :key="value"
            class="flex align-items-center"
          >
            <Checkbox
              v-model="formData.permCodes"
              :input-id="value.toString()"
              :name="name"
              :value="value"
              :disabled="isOptionUnselectable(name)"
            />
            <label
              :for="value.toString()"
              class="ml-2"
            >
              {{ name }}
            </label>
          </div>
        </div>
        <p class="mt-4 mb-2">Restrict to user's email</p>
        <div class="p-inputgroup mb-4">
          <InputSwitch
            v-model="isRestricted"
            class="mt-1"
          />
          <!-- Add email validation -->
          <InputText
            v-show="isRestricted"
            v-model="formData.email"
            name="inviteEmail"
            placeholder="Enter email"
            required
            type="email"
            class="ml-5 mr-8"
          />
        </div>
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
    v-tooltip.bottom="`${props.labelText} Share`"
    class="p-button-lg p-button-text primary"
    :aria-label="`${props.labelText} Share`"
    @click="displayInviteDialog = true"
    @keyup.enter="displayInviteDialog = true"
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
