<script setup lang="ts">
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useForm, ErrorMessage } from 'vee-validate';
import * as yup from 'yup';
import { Button, RadioButton, Checkbox, useToast, TextArea } from '@/lib/primevue';
import { Spinner } from '@/components/layout';
import { BulkPermissionResults } from '@/components/common';

import { Permissions, Regex } from '@/utils/constants';
import { toBulkResult } from '@/utils/formatters';

import { inviteService, permissionService, userService } from '@/services';
import { usePermissionStore, useAuthStore } from '@/store';

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
const permissionStore = usePermissionStore();
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
  permCodes: yup.array().when('action', {
    is: (string: string) => string === 'add',
    then: (schema) => schema.min(1, 'Select one or more access options')
  }),
  expiresAt: yup.string().when('notFound', {
    is: (string: string) => string === 'invite',
    then: (schema) => schema.required('Select an expiry time for email invites')
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
    .min(1, 'Enter one or more email addresses')
});

// create a vee-validate form context
const { values, defineField, handleSubmit } = useForm({
  validationSchema: schema,
  initialValues: {
    action: 'add',
    permCodes: props.resourceType === 'object' ? ['READ'] : [],
    notFound: 'invite',
    expiresAt: 86400,
    multiEmail: ''
  }
});

// map the input models for vee-validate
const [action] = defineField('action', {});
const [permCodes] = defineField('permCodes', {});
const [notFound] = defineField('notFound', {});
const [expiresAt] = defineField('expiresAt', {});
const [multiEmail] = defineField('multiEmail', {});

// require READ perm for file invites
const isDisabled = (optionValue: string) => {
  return props.resourceType === 'object' && optionValue === 'READ';
};

// Form is submitted
const onSubmit = handleSubmit(async (values: any, { resetForm }) => {
  loading.value = true;
  try {
    // put email(s) into an array, delimit, de-dupe and remove empty
    const emailArray: any = [...new Set(values.multiEmail.split(/[\r\n ,;]+/).filter((item: string) => item))];

    // for each email, if user exists in db then give permissions, otherwise send invite
    let permData: Array<{ userId: string; permCode: string }> = [];
    let newUsers: Array<string> = [];
    let resultData = await Promise.all(
      emailArray.map(async (email: string) => {
        const users = (await userService.searchForUsers({ email: email })).data;
        // if an exact match on one account
        if (users.length === 1 && users[0].email === email) {
          if (values.action === 'add') {
            values.permCodes.forEach((pc: string) => {
              permData.push({ userId: users[0].userId, permCode: pc });
            });
          } else if (values.action === 'remove') {
            Object.values(Permissions).forEach((pc: string) => {
              permData.push({ userId: users[0].userId, permCode: pc });
            });
          }
          return { email: email, users: [users[0].userId], permissions: [] };
        }
        // else if adding perms (and users not found)
        else if (values.action === 'add') {
          newUsers.push(email);
          return { email: email };
        }
        // else if removing permissions and more than one matching user was found
        else if (values.action === 'remove' && users.length > 1) {
          users.forEach((u: any) => {
            if (u.email === email) {
              Object.values(Permissions).forEach((pc: string) => {
                permData.push({ userId: u.userId, permCode: pc });
              });
            }
          });
          return { email: email, users: users.map((u: any) => u.userId), permissions: [] };
        }
      })
    );

    // handle permission updates for users already in the system
    if (permData.length > 0) {
      let permResponse;
      if (values.action === 'add') {
        // if adding
        permResponse =
          props.resourceType === 'object'
            ? await permissionService.objectAddPermissions(resourceId.value, permData)
            : await permissionService.bucketAddPermissions(resourceId.value, permData);
      } else {
        // else removing
        const deletePermData = {
          userId: [...new Set(permData.map((item) => item.userId))],
          permCode: Object.values(Permissions)
        };

        permResponse =
          props.resourceType === 'object'
            ? await permissionService.objectDeletePermission(resourceId.value, deletePermData)
            : await permissionService.bucketDeletePermission(resourceId.value, deletePermData);
      }
      // add updated permissions to results
      permResponse.data.forEach((p: any) => {
        const el = resultData.find((r: any) => r.users.includes(p.userId));
        el.permissions.push({
          createdAt: p.createdAt,
          permCode: p.permCode
        });
      });
    }

    // generate invites (for emails not already in the system)
    if (values.action === 'add' && values.notFound === 'invite' && newUsers.length > 0) {
      const expiresAt = Math.floor(Date.now() / 1000) + values.expiresAt;
      const emailResponse = await inviteService.createInvites(
        props.resourceType,
        props.resource,
        getUser.value?.profile,
        newUsers,
        expiresAt,
        values.permCodes
      );
      // add CHES msgId's to results
      emailResponse.data.messages.forEach((msg: { msgId: string; to: Array<string> }) => {
        resultData.find((r: any) => r.email === msg.to[0]).chesMsgId = msg.msgId;
      });
    }

    // format results into human-readable descriptions
    results.value = toBulkResult(values.notFound, values.action, false, resultData);

    // refresh store
    if (props.resourceType === 'object') {
      await permissionStore.fetchObjectPermissions({ objectId: resourceId.value });
      await permissionStore.mapObjectToUserPermissions(resourceId.value);
    } else {
      await permissionStore.fetchBucketPermissions({ bucketId: resourceId.value });
      await permissionStore.mapBucketToUserPermissions(resourceId.value);
    }
    complete.value = true;
    resetForm();
  } catch (error: any) {
    toast.error('Bulk permission operation failed', error.response?.data.detail, { life: 0 });
  }
  loading.value = false;
});
</script>

<template>
  <h3 class="mt-1 mb-2">Bulk add/remove</h3>
  <ul class="mb-4 pl-4">
    <li>Adding users will add permissions in bulk to any existing emails associated with BCBox accounts</li>
    <li>
      Removing users will remove all their permissions to this
      {{ props.resourceType === 'object' ? 'file' : 'folder' }}
    </li>
    <li>
      If you include email addresses not associated with BCBox users, you can choose to send emails to invite them
    </li>
  </ul>

  <form @submit="onSubmit">
    <p class="mb-2">Add or remove permissions</p>
    <div class="flex flex-wrap gap-3 mb-3">
      <div class="flex align-items-center">
        <RadioButton
          v-model="action"
          name="action"
          value="add"
        />
        <label
          for="add"
          class="ml-2"
        >
          Add
        </label>
      </div>
      <div class="flex align-items-center">
        <RadioButton
          v-model="action"
          name="action"
          value="remove"
        />
        <label
          for="remove"
          class="ml-2"
        >
          Remove
        </label>
      </div>
    </div>

    <div v-if="values.action === 'add'">
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
    </div>

    <div v-if="values.action === 'add'">
      <p class="mb-2">If users with specified email(s) are not found?</p>
      <div class="flex flex-wrap gap-3 mb-3">
        <div class="flex align-items-center">
          <RadioButton
            v-model="notFound"
            name="notFound"
            value="ignore"
          />
          <label
            for="ignore"
            class="ml-2"
          >
            Ignore
          </label>
        </div>
        <div class="flex align-items-center">
          <RadioButton
            v-model="notFound"
            name="notFound"
            value="invite"
          />
          <label
            for="invite"
            class="ml-2"
          >
            Send email invite(s)
          </label>
        </div>
      </div>
    </div>

    <div v-if="values.action === 'add' && values.notFound === 'invite'">
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
        <ErrorMessage
          name="expiresAt"
          class="block"
        />
      </div>
    </div>

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
        Enter an email address for each person whose permissions you wish to update for this
        {{ props.resourceType === 'bucket' ? 'folder' : 'file' }}. The email address should be associated with the IDIR
        or BCeID account they will use to sign in to BCBox.
      </small>
      <ErrorMessage name="multiEmail" />
    </div>

    <div class="my-4 inline-flex">
      <Button
        class="p-button p-button-primary mr-3"
        :disabled="loading"
        type="submit"
      >
        Submit
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

  <pre v-if="complete">{{ results }}</pre>
</template>
