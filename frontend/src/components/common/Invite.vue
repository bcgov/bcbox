<script setup lang="ts">
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useForm, ErrorMessage, Form } from 'vee-validate';
import * as yup from 'yup';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { Button, RadioButton, Checkbox, useToast, InputSwitch } from '@/lib/primevue';
import TextInput from '@/components/form/TextInput.vue';
import { Share } from '@/components/common';
import { Spinner } from '@/components/layout';

import { Regex } from '@/utils/constants';

import { inviteService } from '@/services';
import { useAuthStore } from '@/store';

import type { Ref } from 'vue';

// Types
type Props = {
  label: string;
  resourceType: string;
  resource: any;
};

// Props
const props = withDefaults(defineProps<Props>(), {});

// Store
const { getUser } = storeToRefs(useAuthStore());
const toast = useToast();

// State
const inviteLoading: Ref<boolean> = ref(false);
const showInviteLink: Ref<boolean> = ref(false);
const inviteLink: Ref<string> = ref('');

const timeFrames: Record<string, number> = {
  '1 Hour': 3600,
  '8 Hour': 28800,
  '1 Day (Default)': 86400,
  '1 Week': 604800,
  '1 Month (30 days)': 2592000
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

// Permissions selection
const selectedOptions = computed(() => {
  return props.resourceType === 'bucket' ? bucketPermCodes : objectPermCodes;
});

// Form validation schema
const schema = yup.object({
  isRestricted: yup.boolean(),
  email: yup
    .string()
    .matches(new RegExp(Regex.EMAIL), 'Provide a valid email address')
    .when('isRestricted', {
      is: true,
      then: (schema) => schema.required('Email address is required')
    })
});

// create a vee-validate form context
const { values, defineField, errors, handleSubmit } = useForm({
  validationSchema: schema,
  initialValues: {
    expiresAt: 86400,
    permCodes: ['READ'],
    isRestricted: true,
    email: ''
  }
});
// maps the input models for vee-validate
const [expiresAt] = defineField('expiresAt', {});
const [permCodes] = defineField('permCodes', {});
const [isRestricted] = defineField('isRestricted', {});
const [email] = defineField('email', {});

// Invite form is submitted
const onSubmit = handleSubmit(async (values: any) => {
  inviteLoading.value = true;
  try {
    // set expiry date
    const expiresAt = Math.floor(Date.now() / 1000) + values.expiresAt;
    const emails = values.isRestricted ? [values.email] : [];

    // TODO: add perms to users already in the system

    // generate invites (for emails not already in the system)
    const invites = await inviteService.createInvites(
      props.resourceType,
      props.resource,
      getUser.value?.profile,
      emails,
      expiresAt,
      values.permCodes
    );

    // if not restricting to an email, show link
    if (emails.length == 0) {
      inviteLink.value = `${window.location.origin}/invite/${invites[0].token}`;
      toast.success('', 'Invite link created.');
      showInviteLink.value = true;
    }
    // else show email confirmation
    else {
      // TODO: output report (list of invites sent, CHES trx ID (?))
      toast.success('', 'Invite notifications sent.', { life: 5000 });
      showInviteLink.value = false;
    }
  } catch (error: any) {
    toast.error('Creating Invite', error.response?.data.detail, { life: 0 });
  }
  inviteLoading.value = false;
});
</script>

<template>
  <h3 class="mt-1 mb-2">{{ props.label }}</h3>
  <form @submit="onSubmit">
    <p>Make invite available for</p>
    <div class="flex flex-wrap gap-3">
      <div
        v-for="(value, name) in timeFrames"
        :key="value"
        class="flex align-items-center"
      >
        <RadioButton
          v-model="expiresAt"
          name="expiresAt"
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
          v-model="permCodes"
          name="permCodes"
          :value="value"
          :disabled="value === 'READ'"
        />
        <label
          :for="value.toString()"
          class="ml-2"
        >
          {{ name }}
        </label>
      </div>
    </div>

    <p class="mt-4 mb-2">Restrict invite to a user signing in to BCBox with the following email address</p>
    <div class="flex flex-column gap-2">
      <InputSwitch
        v-model="isRestricted"
        name="isRestricted"
        class="mb-3"
      />
    </div>
    <!-- if scoping invite to specific users -->
    <div v-if="values.isRestricted">
      <TextInput
        v-model="email"
        name="email"
        type="text"
        placeholder="Enter email"
        help-text="The Invite will be emailed to this person"
        class="invite-email"
      />
      <div class="my-4 inline-flex">
        <Button
          class="p-button p-button-primary mr-3"
          :disabled="inviteLoading"
          type="submit"
        >
          <font-awesome-icon
            icon="fa fa-envelope"
            class="mr-2"
          />
          Send invite link
        </Button>
        <Spinner
          v-if="inviteLoading"
          class="h-2rem w-2rem"
        />
      </div>
    </div>
    <!-- else generating an open invite -->
    <div v-else>
      <Button
        class="p-button p-button-primary my-3 block"
        type="submit"
      >
        Generate invite link
      </Button>
      <Share
        v-if="showInviteLink"
        label="Invite link"
        :resource-type="resourceType"
        :resource="resource"
        :invite-link="inviteLink"
      />
    </div>
  </form>
</template>

<style scoped lang="scss">
.invite-email:deep(input) {
  width: 80%;
}
</style>
