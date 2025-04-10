<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { watch, onMounted } from 'vue';
import { ObjectMetadata, ObjectProperties, ObjectTag } from '@/components/object';
import { Button } from '@/lib/primevue';
import { useAuthStore, useMetadataStore, useObjectStore, usePermissionStore, useTagStore } from '@/store';
import { Permissions, RouteNames } from '@/utils/constants';
import { onDialogHide } from '@/utils/utils';

// Props
type Props = {
  objectId: string;
};

const props = withDefaults(defineProps<Props>(), {});

// Emits
const emit = defineEmits(['close-object-info']);

// Store
const metadataStore = useMetadataStore();
const objectStore = useObjectStore();
const permissionStore = usePermissionStore();
const tagStore = useTagStore();
const { getUserId } = storeToRefs(useAuthStore());

// Actions
const closeObjectInfo = async () => {
  onDialogHide();
  emit('close-object-info');
};

const obj = objectStore.getObject(props.objectId);

onMounted(() => {
  document.getElementById('side-panel')?.focus();
});

watch(
  props,
  () => {
    if (
      obj &&
      (obj.public || permissionStore.isObjectActionAllowed(obj.id, getUserId.value, Permissions.READ, obj.bucketId))
    ) {
      tagStore.fetchTagging({ objectId: props.objectId });
      metadataStore.fetchMetadata({ objectId: props.objectId });
    }
  },
  { immediate: true }
);
</script>

<template>
  <div
    id="side-panel"
    tabindex="0"
    role="dialog"
    aria-modal="true"
    aria-labelledby="side-panel_label"
    class="side-panel pl-4 pt-2"
  >
    <div class="flex panel-header align-items-start">
      <span class="material-icons-outlined icon-medium mt-2">info</span>
      <h1
        id="side-panel_label"
        class="mt-0 flex-grow-1"
      >
        File details
      </h1>
      <Button
        aria-label="Close"
        class="p-button-rounded p-button-text pt-0 mt-0"
        @click="closeObjectInfo"
      >
        <font-awesome-icon icon="fa-xmark" />
      </Button>
    </div>

    <ObjectProperties
      :object-id="props.objectId"
      :full-view="false"
    />
    <ObjectMetadata
      :editable="false"
      :object-id="props.objectId"
    />
    <ObjectTag
      :editable="false"
      :object-id="props.objectId"
    />
    <div class="col-12 pl-0">
      <router-link
        v-slot="{ navigate }"
        custom
        :to="{ name: RouteNames.DETAIL_OBJECTS, query: { objectId: props.objectId } }"
      >
        <Button
          aria-label="View all details"
          label="Primary"
          class="p-button-outlined"
          @click="navigate"
        >
          <font-awesome-icon icon="file-contract" />
          View all details
        </Button>
      </router-link>
    </div>
  </div>
</template>

<style lang="scss" scoped>
h1 {
  padding-left: 1rem;
}

h2 {
  font-weight: bold;
}

.black {
  color: black;
}

button {
  margin-top: 15px;
  text-indent: 10px;
}
.heading svg {
  color: $bcbox-primary;
}
</style>
