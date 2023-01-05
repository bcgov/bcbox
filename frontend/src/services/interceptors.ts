import axios from 'axios';
import { useAuthStore, useConfigStore } from '../store';

/**
 * @function comsAxios
 * Returns an Axios instance for the COMS API
 * @param {integer} [timeout=10000] Number of milliseconds before timing out the request
 * @returns {object} An axios instance
 */
export function comsAxios(timeout = 10000) {
  const configStore = useConfigStore();
  const axiosOptions = {
    timeout: timeout,
    baseURL: configStore.config.coms.apiPath,
  };

  const instance = axios.create(axiosOptions);

  instance.interceptors.request.use(
    (cfg: any) => {
      const authStore = useAuthStore();
      if (authStore.ready && authStore.getKeycloak.authenticated) {
        cfg.headers.Authorization = `Bearer ${authStore.getKeycloak.token}`;
      }
      return Promise.resolve(cfg);
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  return instance;
}
