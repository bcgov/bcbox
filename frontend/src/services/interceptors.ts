import axios from 'axios';

import { AuthService, ConfigService } from './index';

import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const authService = new AuthService();
const configService = new ConfigService();

/**
 * @function comsAxios
 * Returns an Axios instance for the COMS API
 * @param {number} [timeout=10000] Number of milliseconds before timing out the request
 * @returns {AxiosInstance} An axios instance
 */
export function comsAxios(timeout: number = 10000): AxiosInstance {
  const axiosOptions = {
    timeout: timeout,
    baseURL: configService.getConfig().coms.apiPath,
  };

  const instance = axios.create(axiosOptions);

  instance.interceptors.request.use(
    async (cfg: InternalAxiosRequestConfig) => {
      const user = await authService.getUser();
      if (!!user && !user.expired) {
        cfg.headers.Authorization = `Bearer ${user.access_token}`;
      }
      return Promise.resolve(cfg);
    },
    (error: Error) => {
      return Promise.reject(error);
    }
  );

  return instance;
}
