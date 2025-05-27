<!-- eslint-disable vue/no-v-html -->
<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { isProxy, onMounted, ref, watch } from 'vue';

import { Button, OverlayPanel, Dropdown, RadioButton } from '@/lib/primevue';
import { useUserStore } from '@/store';
import { Regex } from '@/utils/constants';

import type { Ref } from 'vue';
import type { IInputEvent } from '@/interfaces';
import type { DropdownChangeEvent } from '@/lib/primevue';
import type { User, UserPermissions } from '@/types';

// Props
type Props = {
  permissions: UserPermissions[];
};

const props = withDefaults(defineProps<Props>(), {});

// Emits
const emit = defineEmits(['add-user', 'cancel-search-users']);

// Store
const userStore = useUserStore();
const { getExternalUsers, userSearch } = storeToRefs(useUserStore());

// State
const invalidSelectedUser: Ref<boolean> = ref(false);
const selectedIdpType: Ref<string | undefined> = ref('internal');
const selectedUser: Ref<User | null> = ref(null);
const userSearchInput: Ref<string | undefined> = ref('');
const userSearchPlaceholder: Ref<string | undefined> = ref('Name or email address');

// Actions
const getUserDropdownLabel = (option: User) => {
  if (selectedIdpType.value) {
    if (selectedIdpType.value === 'internal') {
      return `${option.fullName} [${option.email}]`;
    } else {
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

const onChange = (event: DropdownChangeEvent) => {
  if (isProxy(event.value)) {
    const user: User = event.value as User;

    // Duplicate user check
    if (!props.permissions.some((perm) => perm.userId === user.userId)) {
      selectedUser.value = user;
      invalidSelectedUser.value = false;
    } else {
      invalidSelectedUser.value = true;
    }

    // Keeps the search input as the email
    userSearchInput.value = user.email;
  }
};

const onInput = (event: IInputEvent) => {
  const input: string = event.target.value;
  if (selectedIdpType.value) {
    // Reset selection on any input change
    selectedUser.value = null;
    invalidSelectedUser.value = false;
    if (selectedIdpType.value === 'internal' && input.length >= 3) {
      userStore.fetchUsers({ idp: 'idir', search: input });
    }
    else if (input.match(Regex.EMAIL)) {
      userStore.fetchUsers({ email: input });
    } else {
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

watch(selectedIdpType, () => {
  // user search field placeholder
  userSearchPlaceholder.value = selectedIdpType.value === 'internal' ?
    'Name or email address' : 'Complete email address';
});

const helpText = ref('');
const help1 = ref();
const help2 = ref();

const toggleHelp = (id: string | undefined, event:any) => {
  switch(id) {
    case 'help1':
      help1.value.toggle(event);
      helpText.value = 'Select the authentication method this person will use to sign into BCBox.';
      break;
    case 'help2':
      help2.value.toggle(event);
      helpText.value = 'Note: If the person you are adding is new to BCBox, ' +
        'please ask them to sign in to the website, so we can find them in the system.';
      break;
  }
};

onMounted(() => {
  onReset();
});
</script>

<template>
  <div>
    <h4 class="mb-3">Add User(s)</h4>
    <div class="mb-2">
      <lable>How will his person sign in to BCBox?</lable>
      <span
        class="help-link material-icons-outlined"
        @click="toggleHelp('help1', $event)"
      >
        help_outline
      </span>
      <OverlayPanel
        ref="help1"
        class="max-w-25rem"
      >
        <span>{{ helpText }}</span>
      </OverlayPanel>
    </div>
    <div class="card flex justify-center mb-4">
      <div class="flex flex-wrap gap-4">
          <div class="flex items-center align-items-center gap-2">
            <RadioButton
              v-model="selectedIdpType"
              input-id="internal"
              name="idpType"
              value="internal"
              @click="onReset"
            />
          <label for="internal">Government IDIR</label>
        </div>
        <div class="flex align-items-center items-center gap-2">
            <RadioButton
              v-model="selectedIdpType"
              input-id="external"
              name="idpType"
              value="external"
              @click="onReset"
            />
            <label for="external">External (eg: BCeID or BC Services Card)</label>
        </div>
      </div>
    </div>

    <div class="mb-2">
      <label>Search for user</label>
      <span
        class="help-link material-icons-outlined"
        @click="toggleHelp('help2', $event)"
      >
        help_outline
      </span>
      <OverlayPanel
        ref="help2"
        class="max-w-25rem"
      >
        <span>{{ helpText }}</span>
      </OverlayPanel>
    </div>
    <div class="flex">
      <div class="flex flex-auto">
        <Dropdown
          v-model="userSearchInput"
          :options="( selectedIdpType === 'external' ? getExternalUsers : userSearch)"
          :option-label="(option: any) => getUserDropdownLabel(option)"
          editable
          :placeholder="userSearchPlaceholder"
          class="mt-1 mb-4"
          :class="invalidSelectedUser ? 'p-invalid' : ''"
          @input="onInput"
          @change="onChange"
        />
      </div>
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
  </div>
</template>

<style lang="scss" scoped>
.p-dropdown {
  width: 100%;
}
</style>
