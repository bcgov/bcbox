<script setup lang="ts">
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useForm, ErrorMessage } from 'vee-validate';
import * as yup from 'yup';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { Button, RadioButton, Checkbox, InputSwitch, useToast, TextArea } from '@/lib/primevue';
import TextInput from '@/components/form/TextInput.vue';
import { Spinner } from '@/components/layout';
import { BulkPermissionResults } from '@/components/common';

import { Regex } from '@/utils/constants';
import { toBulkResult } from '@/utils/formatters';

import { inviteService, permissionService, userService } from '@/services';
import { useAuthStore } from '@/store';

import type { Ref } from 'vue';

// Types
type Props = {
  resourceType: string;
  resource: any;
};
// Props
const props = withDefaults(defineProps<Props>(), {});

// Store
const { getUser } = storeToRefs(useAuthStore());
const toast = useToast();

// State
const resourceId: Ref<string> = computed(() =>
  props.resourceType === 'object' ? props.resource.id : props.resource.bucketId
);
const loading: Ref<boolean> = ref(false);
const complete: Ref<boolean> = ref(false);
const permHelpLink: Ref<string> = computed(() => {
  return props.resourceType === 'bucket'
    ? 'https://github.com/bcgov/bcbox/wiki/My-Files#folder-permissions'
    : 'https://github.com/bcgov/bcbox/wiki/Files#file-permissions';
});
const results: Ref<Array<any>> = ref([]);

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
  permCodes: yup.array().min(1, 'Select one or more access options'),
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
    permCodes: props.resourceType === 'object' ? ['READ'] : [],
    email: '',
    emailType: 'single',
    multiEmail: '',
    notify: true
  }
});
// maps the input models for vee-validate
const [expiresAt] = defineField('expiresAt', {});
const [permCodes] = defineField('permCodes', {});
const [emailType] = defineField('emailType', {});
const [email] = defineField('email', {});
const [multiEmail] = defineField('multiEmail', {});
const [notify] = defineField('notify', {});

// require READ perm for file invites
const isDisabled = (optionValue: string) => {
  return props.resourceType === 'object' && optionValue === 'READ';
};

// Invite form is submitted
const onSubmit = handleSubmit(async (values: any, { resetForm }) => {
  loading.value = true;
  try {
    // put email(s) into an array, delimit, de-dupe and remove empty
    let emailArray;
    if (values.emailType === 'single') emailArray = [values.email];
    else emailArray = [...new Set(values.multiEmail.split(/[\r\n ,;]+/).filter((item: string) => item))];

    // for each email, if user already exists in db then give permissions, otherwise send invite
    let permData: Array<{ userId: string; permCode: string }> = [];
    let newUsers: Array<string> = [];
    let resultData: any = await Promise.all(
      emailArray.map(async (email) => {
        const users = (await userService.searchForUsers({ email: email })).data;
        // if an exact match on one account
        if (users.length === 1 && users[0].email === email) {
          values.permCodes.forEach((pc: string) => {
            permData.push({ userId: users[0].userId, permCode: pc });
          });
          return { email: email, user: users[0], permissions: [] };
        } else {
          newUsers.push(email);
          return { email: email };
        }
      })
    );

    // give permissions to users already in the system
    if (permData.length > 0) {
      const permResponse =
        props.resourceType === 'object'
          ? await permissionService.objectAddPermissions(resourceId.value, permData)
          : await permissionService.bucketAddPermissions(resourceId.value, permData, { recursive: false });
      // add permissions data to result
      permResponse.data.forEach((p: any) => {
        const el = resultData.find((r: any) => r.user.userId === p.userId);
        el.permissions.push({ createdAt: p.createdAt, permCode: p.permCode });
      });
      // if notifying existing users about this file/folder
      if (values.notify) {
        const users = resultData.filter((r: any) => r.user).map((r: any) => r.user);
        const emailResponse = await inviteService.notifyUsers(
          props.resourceType,
          props.resource,
          getUser.value?.profile,
          users
        );
        // add to results
        emailResponse.data.messages.forEach((msg: { msgId: string; to: Array<string> }) => {
          resultData.find((r: any) => r.email === msg.to[0]).chesMsgId = msg.msgId;
        });
      }
    }

    // generate invites (for emails not already in the system)
    if (newUsers.length > 0) {
      const expiresAt = Math.floor(Date.now() / 1000) + values.expiresAt;
      const emailResponse = await inviteService.createInvites(
        props.resourceType,
        props.resource,
        getUser.value?.profile,
        newUsers,
        expiresAt,
        values.permCodes
      );
      // add to results
      emailResponse.data.messages.forEach((msg: { msgId: string; to: Array<string> }) => {
        resultData.find((r: any) => r.email === msg.to[0]).chesMsgId = msg.msgId;
      });
    }
    // format results into human-readable descriptions
    results.value = toBulkResult('invite', 'add', values.notify, resultData);
    complete.value = true;
    resetForm();
  } catch (error: any) {
    toast.error('Creating Invite', error.response?.data.detail ?? error, { life: 0 });
  }
  loading.value = false;
});
</script>

<template>
  <h3 class="mt-1 mb-2">{{ props.resourceType === 'object' ? 'File invite' : 'Folder invite' }}</h3>
  <form @submit="onSubmit">
    <p class="mb-2">Make invite available for</p>
    <div class="flex flex-wrap gap-3 field">
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

    <p class="mb-2">Access options</p>
    <div class="field">
      <div class="flex flex-wrap gap-3 align-items-center">
        <div
          v-for="(name, value) in selectedOptions"
          :key="value"
          class="flex align-items-center"
        >
          <Checkbox
            v-model="permCodes"
            name="permCodes"
            :value="value"
            :disabled="isDisabled(value)"
          />
          <label
            :for="value.toString()"
            class="ml-2"
          >
            {{ name }}
          </label>
        </div>
        <small class="help">
          <a
            :href="`${permHelpLink}`"
            target="_blank"
          >
            Get help understanding permissions
          </a>
        </small>
      </div>
      <ErrorMessage
        name="permCodes"
        class="block"
      />
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
        :help-text="`Enter an email address of the person you are inviting to access this
          ${props.resourceType === 'bucket' ? 'folder' : 'file'}. <br />
          The email address must be associated with the account they will use to sign in to BCBox.`"
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
          class="w-full block"
        />
        <!-- eslint-enable -->
        <small
          id="multiEmail-help"
          class="block"
        >
          Enter an email address for each person you are inviting to access this
          {{ props.resourceType === 'bucket' ? 'folder' : 'file' }}. The email address must be associated with the
          account they will use to sign in to BCBox.
        </small>
        <ErrorMessage name="multiEmail" />
      </div>
    </div>

    <p class="mb-2">If a person you are inviting is already using BCBox</p>
    <div class="flex flex-wrap gap-3 mb-3">
      <InputSwitch
        v-model="notify"
        aria-label="Notify existing BCBox users"
      />
      <span v-if="notify">email them a link to the {{ props.resourceType === 'bucket' ? 'folder' : 'file' }}</span>
      <span v-else>don't send them a notification</span>
    </div>

    <div class="my-4 inline-flex">
      <Button
        class="p-button p-button-primary mr-3"
        :disabled="loading"
        type="submit"
      >
        <font-awesome-icon
          icon="fa fa-envelope"
          class="mr-2"
        />
        <span v-if="values.emailType === 'single'">Send invite link</span>
        <span v-else>Send invites</span>
      </Button>
      <Spinner
        v-if="loading"
        class="h-2rem w-2rem"
      />
    </div>
  </form>
  <BulkPermissionResults
    v-model="complete"
    :results="results"
    :resource="resource"
    :resource-type="resourceType"
  />
</template>

<style scoped lang="scss">
div:has(.invite-email),
.invite-email:deep(input) {
  width: 80%;
}
</style>
