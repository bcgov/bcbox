<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { isProxy, onMounted, ref, watch } from 'vue';

import { Button, Dropdown, RadioButton } from '@/lib/primevue';
import { useConfigStore, useUserStore } from '@/store';
import { Regex } from '@/utils/constants';

import type { Ref } from 'vue';
import type { IChangeEvent, IInputEvent } from '@/interfaces';
import type { IdentityProvider, User, UserPermissions } from '@/types';

// Props
type Props = {
  permissions: UserPermissions[];
};

const props = withDefaults(defineProps<Props>(), {});

// Emits
const emit = defineEmits(['add-user', 'cancel-search-users']);

// Store
const userStore = useUserStore();
const { getConfig } = storeToRefs(useConfigStore());
const { userSearch } = storeToRefs(useUserStore());

// State
const invalidSelectedUser: Ref<boolean> = ref(false);
const selectedIDP: Ref<IdentityProvider | null> = ref(null);
const selectedUser: Ref<User | null> = ref(null);
const userSearchInput: Ref<string | undefined> = ref('');
const userSearchPlaceholder: Ref<string | undefined> = ref('');

// Actions
const getUserDropdownLabel = (option: User) => {
  if( selectedIDP.value?.idp ) {
    if( selectedIDP.value.searchable ) {
      return `${option.fullName} [${option.email}]`;
    }
    else {
      return option.email;
    }
  }
};

const onAdd = () => {
  emit('add-user', selectedUser.value);
  onReset();
};

const onCancel = () => {
  onReset();
  emit('cancel-search-users');
};

const onChange = (event: IChangeEvent) => {
  if(isProxy(event.value)) {
    const user: User = event.value as User;

    // Duplicate user check
    if( !props.permissions.some(perm => perm.userId === user.userId) ) {
      selectedUser.value = user;
      invalidSelectedUser.value = false;
    }
    else {
      invalidSelectedUser.value = true;
    }

    // Keeps the search input as the email
    userSearchInput.value = user.email;
  }
};

const onInput = (event: IInputEvent) => {
  const input: string = event.target.value;
  if( selectedIDP.value?.idp ) {

    // Reset selection on any input change
    selectedUser.value = null;
    invalidSelectedUser.value = false;

    if( selectedIDP.value.searchable && input.length >= 3  ) {
      userStore.fetchUsers({ idp: selectedIDP.value.idp, search: input });
    }
    else if( input.match( Regex.EMAIL ) ) {
      userStore.fetchUsers({ idp: selectedIDP.value.idp, email: input });
    }
    else {
      userStore.clearSearch();
    }
  }
};

const onReset = () => {
  userStore.clearSearch();

  selectedUser.value = null;
  invalidSelectedUser.value = false;
  userSearchInput.value = '';
};

watch(selectedIDP, () => {
  if( selectedIDP.value?.searchable ) {
    userSearchPlaceholder.value = `Enter an existing ${selectedIDP.value?.name} user's name or email address`;
  }
  else {
    userSearchPlaceholder.value = `Enter an existing user's ${selectedIDP.value?.name} email address`;
  }
});

onMounted(() => {
  // Set default IDP
  selectedIDP.value = getConfig.value.idpList[0];

  onReset();
});
</script>

<template>
  <div>
    <div v-if="getConfig.idpList.length <= 3">
      <div
        v-for="idp of getConfig.idpList"
        :key="idp.idp"
        class="field-radiobutton mt-1"
      >
        <RadioButton
          v-model="selectedIDP"
          :input-id="idp.idp"
          name="idp"
          :value="idp"
          @click="onReset"
        />
        <label :for="idp.idp">{{ idp.name }}</label>
      </div>
    </div>
    <div v-else>
      <Dropdown
        v-model="selectedIDP"
        :options="getConfig.idpList"
        :option-label="(option) => {return `${option.name} (${option.elevatedRights ? 'internal': 'external' })`}"
        class="mt-1"
        @change="onReset"
      />
    </div>

    <Dropdown
      v-model="userSearchInput"
      :options="userSearch"
      :option-label="(option) => getUserDropdownLabel(option)"
      editable
      :placeholder="userSearchPlaceholder"
      class="mt-1 mb-4"
      :class="invalidSelectedUser ? 'p-invalid' : ''"
      @input="onInput"
      @change="onChange"
    />
    <Button
      label="Add"
      class="mt-1 mb-4 ml-3"
      icon="pi pi-check"
      :disabled="!selectedUser"
      @click="onAdd"
    />
    <Button
      label="Cancel"
      class="p-button-outlined mt-1 mb-4 ml-3"
      icon="pi pi-times"
      @click="onCancel"
    />
  </div>
</template>

<style lang="scss" scoped>
.p-dropdown {
  width: 60%;
}
</style>
