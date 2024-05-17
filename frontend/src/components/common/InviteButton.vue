<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, ref, watch } from 'vue';

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
import { Spinner } from '@/components/layout';

import { Permissions } from '@/utils/constants';
import { inviteService } from '@/services';
import { useAuthStore, useConfigStore, useObjectStore, usePermissionStore, useBucketStore } from '@/store';

import type { Ref } from 'vue';

// Props
type Props = {
  bucketId?: string;
  objectId?: string;
  labelText: string;
};
type InviteFormData = {
  email?: string;
  bucketId?: string;
  expiresAt?: number;
  objectId?: string;
  permCodes?: Array<string>;
};

// TODO: define a stricter type using a union of COMSObject | Bucket
type Resource  =  any;

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
const { getUserId, getUser } = storeToRefs(useAuthStore());
const permissionStore = usePermissionStore();

const toast = useToast();

// State
const resourceType = props.objectId ? ref('object') : ref('bucket');
const resource: Ref<Resource | undefined> = computed(() => {
  return props.objectId
    ? objectStore.getObject(props.objectId)
    : bucketStore.getBucket(props.bucketId);
});
const isRestricted: Ref<boolean> = ref(false);
const inviteLoading: Ref<boolean> = ref(false);
const showInviteLink: Ref<boolean> = ref(false);
const hasManagePermission: Ref<boolean> = computed(() => {
  return resourceType.value === 'object'
    ? permissionStore.isObjectActionAllowed(props.objectId, getUserId.value, Permissions.MANAGE, resource.value?.bucketId)
    : permissionStore.isBucketActionAllowed(props.bucketId, getUserId.value, Permissions.MANAGE);
});

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
  return resourceType.value === 'bucket' ? bucketPermCodes : objectPermCodes;
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
async function invite() {
  inviteLoading.value = true;
  try {
    // set expiry date
    let expiresAt;
    if (formData.value.expiresAt) {
      expiresAt = Math.floor(Date.now() / 1000) + formData.value.expiresAt;
    }
    // put input email addresses into an array
    const emails = isRestricted.value && formData.value.email ? [formData.value.email] : [];
    // TODO: add perms to users already in the system

    // generate invites (for emails not already in the system)
    const invites = await inviteService.createInvites(
      resourceType.value,
      resource.value,
      getUser.value?.profile,
      emails,
      expiresAt,
      formData.value.permCodes,
    );

    // if not restricting to an email, show link
    if(emails.length == 0) {
      inviteLink.value = `${window.location.origin}/invite/${invites[0].token}`;
      toast.success('', 'Invite link created.');
      showInviteLink.value = true;
    }
    // else show email confirmation
    else {
      // TODO: output report (list of invites sent, CHES trx ID (?))
      toast.success('', 'Invite notifications sent.', {life: 5000});
      showInviteLink.value = false;
    }
  } catch (error: any) {
    console.log('d', error.response);
    toast.error('Creating Invite', error.response.data.detail, {life: 0});
  }
  inviteLoading.value = false;
}
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
        {{ resourceType === 'object' ? resource?.name : resource?.bucketName }}
    </h3>

    <ul class="mb-4">
      <li>If a user already has permissions, you can link them with a share link</li>
      <li>
        Invite someone using an invite link - the links are single-use; you must generate a new link for each user you
        intend to send this to
      </li>
      <li>
        To share publicly or with a direct link,
        you must set the file to public - this only works for individual files
      </li>
    </ul>
    <TabView>
      <TabPanel
        v-if="resource?.public"
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
        :disabled="resource?.public"
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
        <h3 class="mt-1 mb-2">{{ (props.labelText) }} Invite</h3>
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
        <!-- <p class="mt-4 mb-2">Restrict invite to a user signing in to BCBox with the following email address</p> -->
        <div class="flex flex-column gap-2">
          <InputSwitch
            v-model="isRestricted"
          />
          <InputText
            v-show="isRestricted"
            v-model="formData.email"
            name="inviteEmail"
            placeholder="Enter email"
            required
            type="email"
            class="mt-2 max-w-30rem"
          />
          <small v-show="isRestricted" id="inviteEmail-help">The Invite will be emailed to this person</small>
          </div>
        <div class="my-4 inline-flex p-0">
          <Button
            class="p-button p-button-primary mr-3"
            @click="invite"
            :disabled="inviteLoading"
          >
            <font-awesome-icon
              icon="fa fa-envelope"
              class="mr-2"
            />
            Generate invite link
          </Button>
          <Spinner
            v-if="inviteLoading"
          />
        </div><br />

        <ShareLinkContent
          v-if="showInviteLink"
          :share-link="inviteLink"
          label="Invite Link"
        />
      </TabPanel>
    </TabView>
  </Dialog>
  <Button
    v-tooltip.bottom="`Share ${props.labelText.toLocaleLowerCase()}`"
    class="p-button-lg p-button-text primary"
    :aria-label="`Share ${props.labelText.toLocaleLowerCase()}`"
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
