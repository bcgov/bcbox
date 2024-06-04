<script setup lang="ts">
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useForm, ErrorMessage } from 'vee-validate';
import * as yup from 'yup';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { Button, RadioButton, Checkbox, useToast, TextArea } from '@/lib/primevue';
import TextInput from '@/components/form/TextInput.vue';
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
const schema = yup.object().shape({
  email: yup
    .string()
    .matches(new RegExp(Regex.EMAIL), 'Provide a valid email address')
    .when('emailType', {
      is: (string: string) => string === 'single',
      then: (schema) => schema.required('Email address is required')
    }),
  multiEmail: yup
    .array()
    .transform(function (value, originalValue) {
      if (this.isType(value) && value !== null) return value;
      return originalValue ? originalValue.split(/[\r\n ,;]+/).filter((item: string) => item) : [];
    })
    .of(
      yup
        .string()
        .matches(new RegExp(Regex.EMAIL), 'Provide a list of valid email addresses separated by commas or semicolons')
    )
    .when('emailType', {
      is: (string: string) => string === 'multi',
      then: (schema) => schema.min(1, 'Enter one or more email addresses')
    })
});

// create a vee-validate form context
const { values, defineField, handleSubmit } = useForm({
  validationSchema: schema,
  initialValues: {
    expiresAt: 86400,
    permCodes: ['READ'],
    email: '',
    emailType: 'single',
    multiEmail: ''
  }
});
// maps the input models for vee-validate
const [expiresAt] = defineField('expiresAt', {});
const [permCodes] = defineField('permCodes', {});
const [emailType] = defineField('emailType', {});
const [email] = defineField('email', {});
const [multiEmail] = defineField('multiEmail', {});

// Invite form is submitted
const onSubmit = handleSubmit(async (values: any) => {
  inviteLoading.value = true;
  try {
    // set expiry date
    const expiresAt = Math.floor(Date.now() / 1000) + values.expiresAt;
    // put email(s) into an array
    let emailArray;
    if (values.emailType === 'single') emailArray = [values.email];
    // for list of emails, delimit, de-dupe and remove empty
    else emailArray = [...new Set(values.multiEmail.split(/[\r\n ,;]+/).filter((item: string) => item))];

    // TODO: add perms to users already in the system
    // generate invites (for emails not already in the system)
    await inviteService.createInvites(
      props.resourceType,
      props.resource,
      getUser.value?.profile,
      emailArray,
      expiresAt,
      values.permCodes
    );
    // TODO: output report (list of invites sent, CHES trx ID (?))
    toast.success('', 'Invite notifications sent.', { life: 5000 });
  } catch (error: any) {
    toast.error('Creating Invite', error.response?.data.detail, { life: 0 });
  }
  inviteLoading.value = false;
});
</script>

<template>
  <h3 class="mt-1 mb-2">{{ props.label }}</h3>
  <form @submit="onSubmit">
    <p class="mb-2">Make invite available for</p>
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
    <div class="flex flex-wrap gap-3 mb-4">
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

    <p class="mb-2">Send to</p>
    <div class="flex flex-wrap gap-3 mb-3">
      <div class="flex align-items-center">
        <RadioButton
          v-model="emailType"
          name="emailType"
          value="single"
        />
        <label
          for="single"
          class="ml-2"
        >
          Single
        </label>
      </div>
      <div class="flex align-items-center">
        <RadioButton
          v-model="emailType"
          name="emailType"
          value="multi"
        />
        <label
          for="multi"
          class="ml-2"
        >
          Multiple
        </label>
      </div>
    </div>

    <div v-if="values.emailType === 'single'">
      <TextInput
        v-model="email"
        name="email"
        type="text"
        placeholder="Enter email"
        help-text="The Invite will be emailed to this person"
        class="invite-email"
      />
    </div>
    <div v-else>
      <div class="field">
        <!-- eslint-disable -->
        <TextArea
          v-model="multiEmail"
          name="multiEmail"
          type="textarea"
          placeholder="Enter email(s) separated by commas (, ) or semicolons (; ) - for example: email1@gov.bc.ca, email2@gov.bc.ca"
          class="multi-email block"
        />
        <!-- eslint-enable -->
        <small
          id="multiEmail-help"
          class="block"
        >
          Enter an email address for each person you are inviting to access this
          {{ props.resourceType === 'bucket' ? 'folder' : 'file' }}. The email address must be associated with the
          account they use to sign in to BCBox.
        </small>
        <ErrorMessage name="multiEmail" />
      </div>
    </div>

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
  </form>
</template>

<style scoped lang="scss">
.invite-email:deep(input) {
  width: 80%;
}
.multi-email {
  width: 100%;
}
</style>
