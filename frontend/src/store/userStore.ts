import { ref } from 'vue';
import { defineStore } from 'pinia';
import type { User } from '@/interfaces';
import { userService } from '@/services';

export const useUserStore = defineStore('user', () => {
  const userSearch = ref([] as User[]);
  const idps = ref([] as Object[]);
  const loading = ref(false);

  async function searchUsers(params: Object) {
    try {
      loading.value = true;
      userSearch.value = (await userService.searchForUsers(params)).data;
    } catch (error) {
      console.error(`searchUsers error: ${error}`);
      // So that a caller can action it
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function listIdps() {
    try {
      loading.value = true;
      idps.value = (await userService.listIdps()).data;
    } catch (error) {
      console.error(`listIdps error: ${error}`);
      // So that a caller can action it
      throw error;
    } finally {
      loading.value = false;
    }
  }

  return { userSearch, idps, loading, searchUsers, listIdps };
});
