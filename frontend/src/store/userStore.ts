import { defineStore, storeToRefs } from 'pinia';
import { computed, ref } from 'vue';

import { userService } from '@/services';
import { useAppStore, useAuthStore, useConfigStore } from '@/store';
import { isDebugMode } from '@/utils/utils';

import type { Ref } from 'vue';
import type { IdentityProvider, User } from '@/types';

export type UserStoreState = {
  currentUser: Ref<User | null>;
  idps: Ref<Array<IdentityProvider>>;
  userSearch: Ref<Array<User>>;
}

export const useUserStore = defineStore('user', () => {
  const appStore = useAppStore();

  // Store
  const { getIsAuthenticated, getIdentityId } = useAuthStore();
  const { getConfig } = storeToRefs(useConfigStore());

  // State
  const state: UserStoreState = {
    currentUser: ref(null),
    idps: ref([]),
    userSearch: ref([]),
  };

  // Getters
  const getters = {
    getCurrentUser: computed(() => state.currentUser.value),
    getIdps: computed(() => state.idps.value),
    getUserSearch: computed(() => state.userSearch.value),
  };

  // Actions
  async function init() {
    await getUser();
  }

  // Hydrates the logged in users info from the COMS database
  async function getUser(): Promise<string | void> {
    if (!state.currentUser.value && getIsAuthenticated) {
      if (getIdentityId) {
        await searchUsers({ identityId: getIdentityId });

        if (state.userSearch.value.length) {
          state.currentUser.value = state.userSearch.value[0];
          state.currentUser.value.elevatedRights = getConfig.value.idpList.find((idp: any) => {
            return idp.idp === state.userSearch.value[0].idp;
          })?.elevatedRights;
        }
        return Promise.resolve();
      }
    }
    return Promise.resolve('Not authenticated');
  }

  async function listIdps() {
    try {
      appStore.beginIndeterminateLoading();
      state.idps.value = (await userService.listIdps()).data;
    } catch (error) {
      console.error(`listIdps error: ${error}`); // eslint-disable-line no-console
      // So that a caller can action it
      throw error;
    } finally {
      appStore.endIndeterminateLoading();
    }
  }

  async function searchUsers(params: object) {
    try {
      appStore.beginIndeterminateLoading();
      const response = (await userService.searchForUsers(params)).data;

      // Filter out any user without an IDP
      state.userSearch.value = response.filter((x: User) => x.identityId !== null);
    } catch (error) {
      console.error(`searchUsers error: ${error}`); // eslint-disable-line no-console
      // So that a caller can action it
      throw error;
    } finally {
      appStore.endIndeterminateLoading();
    }
  }

  function clearSearch() {
    state.userSearch.value = [];
  }

  return {
    // State
    ...(isDebugMode && state),

    // Getters
    ...getters,

    // Actions
    clearSearch,
    getUser,
    init,
    listIdps,
    searchUsers
  };
});

export default useUserStore;
