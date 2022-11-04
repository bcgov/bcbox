import { ref } from 'vue';
import { defineStore } from 'pinia';
import axios from 'axios';

export const useConfigStore = defineStore('config', () => {
  // state
  const config: any = ref(null);

  // actions
  async function load() {
    // TODO: more to do here, store config in storage? Flesh out error cases
    const response = await axios.get('/config');
    config.value = response.data;
  }

  return { load, config };
});
