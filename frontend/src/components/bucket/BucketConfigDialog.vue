<script setup lang="ts">
import Dialog from 'primevue/dialog';
import BucketConfigForm from '@/components/bucket/BucketConfigForm.vue';
import type { Bucket } from '@/interfaces';

const props = defineProps<{
  display: boolean;
  header: string;
  title: string;
  bucket?: Bucket;
}>();

const emit = defineEmits(['close-bucket-config']);

const closeDialog = () => {
  emit('close-bucket-config');
};
</script>

<template>
  <Dialog
    :visible="props.display"
    :style="{width: '50vw'}"
    :modal="true"
    @update:visible="closeDialog"
  >
    <template #header>
      <div class="flex">
        <font-awesome-icon
          icon="fas fa-cog"
          class="pr-3 pt-2"
          style="font-size: 2rem"
        />
        <div>
          <h1>{{ header }}</h1>
          <h3>{{ title }}</h3>
        </div>
      </div>
    </template>
    <BucketConfigForm
      :bucket="props.bucket"
      @submit-bucket-config="closeDialog"
      @cancel-bucket-config="closeDialog"
    />
  </Dialog>
</template>
