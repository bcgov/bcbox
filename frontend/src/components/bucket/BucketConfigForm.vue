<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { Form } from 'vee-validate';
import { object, string } from 'yup';
import { differenceInSeconds } from 'date-fns';

import Password from '@/components/form/Password.vue';
import TextInput from '@/components/form/TextInput.vue';
import { SyncButton } from '@/components/common';

import { Button, useToast } from '@/lib/primevue';
import { useAuthStore, useBucketStore } from '@/store';
import { ButtonMode } from '@/utils/enums';
import { differential, getBucketPath, joinPath } from '@/utils/utils';

import type { Ref } from 'vue';
import type { Bucket } from '@/types';

export type BucketForm = {
  accessKeyId?: string;
  bucket?: string;
  bucketName?: string;
  endpoint?: string;
  key?: string;
  secretAccessKey?: string;
};

// Props
type Props = {
  bucket?: Bucket & { isRoot?: boolean };
};

const props = withDefaults(defineProps<Props>(), {
  bucket: undefined
});

// Emits
const emit = defineEmits(['cancel-bucket-config', 'submit-bucket-config']);

// Store
const bucketStore = useBucketStore();
const { getUserId } = storeToRefs(useAuthStore());

// Default form values
const initialValues: BucketForm = {
  accessKeyId: props.bucket?.accessKeyId,
  bucket: props.bucket?.bucket,
  bucketName: props.bucket?.bucketName,
  endpoint: props.bucket?.endpoint,
  key: props.bucket?.key,
  secretAccessKey: props.bucket?.secretAccessKey
};

// Form validation schema
const schema = object({
  accessKeyId: string().max(255).required().label('Access Key ID'),
  bucket: string().max(255).required().label('Bucket'),
  bucketName: string().max(255).required().label('Folder name'),
  endpoint: string().max(255).required().label('Endpoint'),
  key: string()
    .matches(/^[^\\]+$/, { excludeEmptyString: true, message: 'Path must not contain backslashes' })
    .max(255),
  secretAccessKey: string().max(255).required().label('Secret Access Key')
});

// Actions
const toast = useToast();

const onSubmit = async (values: any) => {
  try {
    const formBucket = {
      accessKeyId: values.accessKeyId,
      bucket: values.bucket,
      bucketName: values.bucketName,
      endpoint: values.endpoint,
      secretAccessKey: values.secretAccessKey
    } as Bucket;

    // Only add key for new configurations
    if (!props.bucket && values.key && joinPath(values.key)) {
      formBucket.key = joinPath(values.key);
    }

    const bucketChanges = differential(formBucket, initialValues);

    const bucketModel = props.bucket
      ? await bucketStore.updateBucket(props.bucket?.bucketId, bucketChanges)
      : await bucketStore.createBucket(formBucket);

    emit('submit-bucket-config');
    toast.success('Configuring storage', '');

    // If added a new configuration, do a recursive sync of this bucket
    if (!props.bucket) {
      await bucketStore
        .syncBucket(bucketModel.bucketId, true)
        .then(() => toast.info('Sync in progress', ''))
        .catch((error) => toast.error('Unable to sync with storage location', error, { life: 0 }));
    }

    // refresh bucket list
    await bucketStore.fetchBuckets({ userId: getUserId.value, objectPerms: true });

    // trim trailing "//", if present
    const currBucketPath = getBucketPath(initialValues as Bucket).endsWith('//')
      ? getBucketPath(initialValues as Bucket).slice(0, -1)
      : getBucketPath(initialValues as Bucket);

    const hasChildren = bucketStore.buckets.some(
      (b) => getBucketPath(b).includes(currBucketPath) && getBucketPath(b) !== currBucketPath
    );

    if ((bucketChanges.accessKeyId || bucketChanges.secretAccessKey) && hasChildren) {
      toast.info('Subfolders exist', 'Remember to update their credentials where applicable', {
        life: 10000
      });
    }
  } catch (error: any) {
    toast.error('Configuring storage', error.response?.data.detail ?? error, { life: 0 });
  }
};

const onCancel = () => {
  emit('cancel-bucket-config');
};

// disable some form fields if configuring a subfolder
const timeToNextManual: Ref<number> = ref(0);
const syncButtonDisabled = ref(true);

const updateSyncButtonStatus = async () => {
  if (props.bucket) {
    const manualMinimum = 1800; // 30 minutes
    const now = new Date();
    // if sync in progress, show status
    const syncQueueSize: Ref<number> = ref(0);
    syncQueueSize.value = await bucketStore.syncBucketStatus(props.bucket.bucketId);
    if (syncQueueSize.value > 0) {
      const word = syncQueueSize.value > 1 ? 'files' : 'file';
      toast.info('Sync in progress.', `${syncQueueSize.value} ${word} remaining.`, { life: 0 });
      timeToNextManual.value = manualMinimum;
    } else {
      const lastSyncDate = new Date(props.bucket.lastSyncRequestedDate as string);
      const sinceLastSyncDate = differenceInSeconds(now, lastSyncDate);
      // if havent synced for 30 minutes, enable button
      if (sinceLastSyncDate > manualMinimum) {
        syncButtonDisabled.value = false;
      }
      // else show time until minimum has passed since last
      else {
        timeToNextManual.value = Math.ceil((manualMinimum - sinceLastSyncDate) / 60);
      }
    }
  }
};
onBeforeMount(async () => {
  updateSyncButtonStatus();
});
</script>

<template>
  <div>
    <Form
      :initial-values="initialValues"
      :validation-schema="schema"
      @submit="onSubmit"
    >
      <TextInput
        name="bucketName"
        label="Folder name *"
        placeholder="eg: My Documents"
        help-text="Your custom display name for the storage location,
          shown in BCBox as a folder."
        focus-trap
      />
      <TextInput
        :disabled="props.bucket && !props.bucket.isRoot"
        name="bucket"
        label="Bucket *"
        placeholder="eg: mybucket"
        :help-text="'The name of the bucket given to you. For example: \'yxwgj\'.'"
      />
      <TextInput
        :disabled="props.bucket && !props.bucket.isRoot"
        name="endpoint"
        label="Endpoint *"
        placeholder="eg: https://nrs.objectstore.gov.bc.ca"
        help-text="The URL of your object storage namespace without the bucket identifier/name."
      />
      <Password
        :disabled="props.bucket && !props.bucket.isRoot"
        name="accessKeyId"
        label="Access key ID *"
        placeholder=""
        help-text="User/Account identifier or username."
      />
      <Password
        :disabled="props.bucket && !props.bucket.isRoot"
        name="secretAccessKey"
        label="Secret access key *"
        placeholder=""
        help-text="A password used to access the bucket."
      />
      <TextInput
        name="key"
        label="Path"
        placeholder="/"
        help-text="Optionally mounts the storage location at a specific path.
          A folder will be created if it does not already exist.<br />
          This will default to the root '/' if not provided."
        :disabled="!!props.bucket"
      />
      <div class="flex flex-row">
        <Button
          class="flex p-button mt-2 mr-2"
          label="Apply"
          type="submit"
          icon="pi pi-check"
        />
        <Button
          class="flex p-button-outlined mt-2 mr-2"
          label="Cancel"
          icon="pi pi-times"
          @click="onCancel"
        />
        <span
          v-tooltip.left="
            syncButtonDisabled
              ? `Sync will be available in ${timeToNextManual} minutes`
              : 'Sync all files and sub-folders with storage'
          "
          class="flex ml-auto mt-2"
        >
          <SyncButton
            v-if="props.bucket"
            :disabled="syncButtonDisabled"
            :bucket-id="bucket?.bucketId"
            :mode="ButtonMode.BUTTON"
            :recursive="true"
          />
        </span>
      </div>
    </Form>
  </div>
</template>

<style lang="scss" scoped>
:deep(.p-inputtext) {
  width: 100% !important;
}

:deep(.pi-eye) {
  right: auto !important;
  margin-left: 10px;
}

:deep(.pi-eye-slash) {
  right: auto !important;
  margin-left: 10px;
}
</style>
