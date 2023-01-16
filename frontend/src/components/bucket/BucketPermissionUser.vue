<script setup lang="ts">
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { ref } from 'vue';
import Button from 'primevue/button';
import Dropdown from 'primevue/dropdown';
import { useBucketStore, useUserStore } from '@/store';
import type { User } from '@/interfaces';

const userStore = useUserStore();

const { permissions } = storeToRefs(useBucketStore());
const { userSearch } = storeToRefs(useUserStore());

onMounted(() => {
  reset();
});

const isAddDisabled: any = ref(true);
const showUserExistError: any = ref(false);
const selectedUser = ref();

const emit = defineEmits(['cancel-bucket-permission-user']);

const cancelBucketPermissionUser = async () => {
  isAddDisabled.value = true;
  reset();
  emit('cancel-bucket-permission-user');
};

const ifUserExist = () => {
  return permissions.value.some(e => e.fullName === selectedUser.value.fullName);
};

const onInput = async (event: any) => {
  showUserExistError.value = ifUserExist();
  var inputValue = event.target.value;
  if(inputValue.length > 0) {
    await userStore.searchUsers({ search: event.target.value });
  }
  if(inputValue.length < 1) {
    reset();
  }
  if (selectedUser.value !== null && selectedUser.value.fullName === undefined) {
    isAddDisabled.value = true;
  }
};

const onChange = () => {
  showUserExistError.value = ifUserExist();
  isAddDisabled.value = (selectedUser.value === null || ifUserExist());
};

const onAdd = () => {
  if(selectedUser.value !== null && !ifUserExist()) {
    permissions.value.push(
      {
        userId: selectedUser.value.userId,
        elevatedRights: true,
        fullName: selectedUser.value.fullName,
        create: false,
        read: false,
        update: false,
        delete: false,
        manage: false
      }
    );
    reset();
  }
};

const reset = () => {
  userSearch.value = ([] as User[]);
  selectedUser.value = null;
};

</script>

<template>
  <Dropdown
    v-model="selectedUser"
    :options="userSearch"
    option-label="fullName"
    :editable="true"
    placeholder="enter full name"
    class="mt-1 mb-4"
    :class="showUserExistError ? 'p-invalid' : ''"
    @input="onInput"
    @change="onChange"
  />
  <Button
    label="Add"
    class="mt-1 mb-4 ml-3"
    icon="pi pi-check"
    :disabled="isAddDisabled"
    @click="onAdd"
  />
  <Button
    label="Cancel"
    class="p-button-text mt-1 mb-4 ml-3"
    icon="pi pi-times"
    @click="cancelBucketPermissionUser"
  />
</template>

<style lang="scss" scoped>
.p-dropdown {
  width: 60%;
}
</style>
