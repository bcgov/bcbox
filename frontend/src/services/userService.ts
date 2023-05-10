import { comsAxios } from './interceptors';

import type { AxiosResponse } from 'axios';
import type { SearchUsersOptions } from '@/types';

const PATH = 'user';

export default {
  /**
   * @function searchForUsers
   * Returns a list of users based on the provided filtering parameters
   * @param {SearchUsersOptions} params SearchUsersOptions object containing the data to filter against
   * @returns {Promise<AxiosResponse>} An axios response
   */
  searchForUsers(params: SearchUsersOptions): Promise<AxiosResponse> {
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
