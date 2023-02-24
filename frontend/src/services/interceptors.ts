import axios from 'axios';
import { useAuthStore, useConfigStore } from '../store';

/**
 * @function comsAxios
 * Returns an Axios instance for the COMS API
 * @param {integer} [timeout=10000] Number of milliseconds before timing out the request
 * @returns {object} An axios instance
 */
export function comsAxios(timeout = 10000) {
  const { getConfig } = useConfigStore();
  const axiosOptions = {
    timeout: timeout,
    baseURL: getConfig.coms.apiPath,
  };

  const instance = axios.create(axiosOptions);

  instance.interceptors.request.use(
    (cfg: any) => {
      const { getIsAuthenticated, getAccessToken } = useAuthStore();
      if (getIsAuthenticated) {
        cfg.headers.Authorization = `Bearer ${getAccessToken}`;
      }
      return Promise.resolve(cfg);
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  return instance;
}
