import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import { useToast } from '@/lib/primevue';
import { userService } from '@/services';
import { useAppStore } from '@/store';
import { partition } from '@/utils/utils';

import type { Ref } from 'vue';
import type { IdentityProvider, SearchUsersOptions, User } from '@/types';

export type UserStoreState = {
  currentUser: Ref<User | null>;
  idps: Ref<Array<IdentityProvider>>;
  userSearch: Ref<Array<User>>;
};

export const useUserStore = defineStore('user', () => {
  const toast = useToast();

  // Store
  const appStore = useAppStore();

  // State
  const state: UserStoreState = {
    currentUser: ref(null),
    idps: ref([]),
    userSearch: ref([])
  };

  // Getters
  const getters = {
    getIdps: computed(() => state.idps.value),
    // returns a single User for provided user ID
    getUser: computed(
      () => (userId: string | undefined) => state.userSearch.value.find((x: User) => userId === x.userId)
    ),
    // returns an array of Users corresponding to provided user IDs
    getUsers: computed(() => (userIds?: Array<string>) => {
      if (userIds && userIds.length) {
        return state.userSearch.value.filter((x: User) => {
          return userIds.includes(x.userId);
        });
      } else {
        return state.userSearch.value;
      }
    }),
    getExternalUsers: computed(() => state.userSearch.value.filter((x: User) => x.idp !== 'idir')
    ),

  };

  // Actions
  async function fetchUsers(params: SearchUsersOptions) {
    try {
      appStore.beginIndeterminateLoading();

      // Search & filter out any user without an IDP
      const response = (await userService.searchForUsers(params)).data.filter((x: User) => !!x.identityId);

      // Remove old values matching search parameters
      const matches = (x: User) =>
        (!params.userId ||
          (Array.isArray(params.userId) && params.userId.some((y: string | undefined) => x.userId === y)) ||
          (!Array.isArray(params.userId) && params.userId === x.userId)) &&
        (!params.email || x.email === params.email) &&
        (!params.idp || x.idp === params.idp) &&
        (!params.lastName || x.lastName === params.lastName);

      const [, difference] = partition(state.userSearch.value, matches);

      // Merge and assign
      state.userSearch.value = difference.concat(response);
    } catch (error: any) {
      toast.error('Searching users', error.response?.data.detail ?? error, { life: 0 });
    } finally {
      appStore.endIndeterminateLoading();
    }
  }

  function clearSearch() {
    state.userSearch.value = [];
  }

  return {
    // State
    ...state,

    // Getters
    ...getters,

    // Actions
    clearSearch,
    fetchUsers
  };
});

export default useUserStore;
