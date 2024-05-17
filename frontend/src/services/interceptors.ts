import axios from 'axios';

import { AuthService, ConfigService } from './index';

import type { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';

/**
 * @function appAxios
 * Returns an Axios instance for the application API
 * @param {AxiosRequestConfig} options Axios request config options
 * @returns {AxiosInstance} An axios instance
 */
export function appAxios(options: AxiosRequestConfig = {}): AxiosInstance {

  console.log(new ConfigService().getConfig().apiPath);

  const instance = axios.create({
    baseURL: '/' + new ConfigService().getConfig().apiPath,
    timeout: 10000,
    ...options
  });

  instance.interceptors.request.use(
    async (cfg: InternalAxiosRequestConfig) => {
      const authService = new AuthService();
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

/**
 * @function comsAxios
 * Returns an Axios instance for the COMS API
 * @param {AxiosRequestConfig} options Axios request config options
 * @returns {AxiosInstance} An axios instance
 */
export function comsAxios(options: AxiosRequestConfig = {}): AxiosInstance {
  const instance = axios.create({
    baseURL: new ConfigService().getConfig().coms.apiPath,
    timeout: 10000,
    ...options
  });

  instance.interceptors.request.use(
    async (cfg: InternalAxiosRequestConfig) => {
      const authService = new AuthService();
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
