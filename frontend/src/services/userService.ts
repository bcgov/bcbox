import { comsAxios } from './interceptors';

import type { AxiosResponse } from 'axios';

const PATH = 'user';

export default {
  /**
   * @function searchForUsers
   * Returns a list of users based on the provided filtering parameters
   * @param {object} params Object containing the data to filter against
   * @returns {Promise<AxiosResponse>} An axios response
   */
  searchForUsers(params: object): Promise<AxiosResponse> {
    return comsAxios().get(`${PATH}`, { params: params });
  },

  /**
   * @function listIdps
   * Fetch identity providers
   * @returns {Promise} An axios response
   */
  listIdps(): Promise<AxiosResponse> {
    return comsAxios().get(`${PATH}/idpList`);
  },
};
