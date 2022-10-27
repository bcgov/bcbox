import axios from 'axios';

/**
 * @function appAxios
 * Returns an Axios instance
 * @param {integer} [timeout=10000] Number of milliseconds before timing out the request
 * @returns {object} An axios instance
 */
export function appAxios(timeout = 10000) {
  const axiosOptions = { timeout: timeout };
  const instance = axios.create(axiosOptions);
  return instance;
}
