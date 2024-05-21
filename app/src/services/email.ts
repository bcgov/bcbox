import axios from 'axios';
import config from 'config';

import type { AxiosInstance } from 'axios';
import type { Email } from '../types';

/**
 * @function getToken
 * Gets Auth token using CHES client credentials
 * @returns
 */
async function getToken() {
  const response = await axios({
    method: 'POST',
    url: config.get('server.ches.tokenUrl'),
    data: {
      grant_type: 'client_credentials',
      client_id: config.get('server.ches.clientId'),
      client_secret: config.get('server.ches.clientSecret')
    },
    headers: {
      'Content-type': 'application/x-www-form-urlencoded'
    },
    withCredentials: true
  });
  return response.data.access_token;
}
/**
 * @function chesAxios
 * Returns an Axios instance with Authorization header
 * @param {AxiosRequestConfig} options Axios request config options
 * @returns {AxiosInstance} An axios instance
 */
function chesAxios(): AxiosInstance {
  // Create axios instance
  const chesAxios = axios.create({
    baseURL: config.get('server.ches.apiPath'),
    timeout: 10000
  });
  // Add bearer token
  chesAxios.interceptors.request.use(async (config) => {
    const token = await getToken();
    const auth = token ? `Bearer ${token}` : '';
    config.headers['Authorization'] = auth;
    return config;
  });
  return chesAxios;
}

const service = {
  /**
   * @function emailMerge
   * Sends emails with CHES service
   * https://ches.api.gov.bc.ca/api/v1/docs#tag/EmailMerge/operation/postMerge
   * @param emailData
   * @returns Axios response status and data
   */
  emailMerge: async (emailData: Email) => {
    try {
      const { data, status } = await chesAxios().post('/emailMerge', emailData, {
        headers: {
          'Content-Type': 'application/json'
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });
      return { data, status };
    } catch (e: unknown) {
      if (axios.isAxiosError(e)) {
        return {
          data: e.response?.data.error_description,
          status: e.response ? e.response.status : 500
        };
      } else {
        return {
          data: 'Error sending email',
          e,
          status: 500
        };
      }
    }
  },
};

export default service;
