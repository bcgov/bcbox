import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { useConfigStore } from '@/store/configStore';
const authStore = useAuthStore();
const configStore = useConfigStore();

/**
 * @function comsAxios
 * Returns an Axios instance for the COMS API
 * @param {integer} [timeout=10000] Number of milliseconds before timing out the request
 * @returns {object} An axios instance
 */
export function comsAxios(timeout = 10000) {
  const axiosOptions = {
    timeout: timeout,
    baseURL: configStore.config.coms.apiPath,
  };

  const instance = axios.create(axiosOptions);

  instance.interceptors.request.use(
    (cfg: any) => {
      if (authStore.ready && authStore.getAuthenticated) {
        cfg.headers.Authorization = `Bearer ${authStore.getToken}`;
      }
      return Promise.resolve(cfg);
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  return instance;
}
