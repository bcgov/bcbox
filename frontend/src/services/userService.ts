import { comsAxios } from './interceptors';

import type { AxiosResponse } from 'axios';
import type { SearchUsersOptions } from '@/types';

import { SYSTEM_USER } from '@/utils/constants';

const PATH = 'user';

export default {
  /**
   * @function searchForUsers
   * Returns a list of users based on the provided filtering parameters
   * @param {SearchUsersOptions} params SearchUsersOptions object containing the data to filter against
   * @returns {Promise<AxiosResponse>} An axios response or empty array
   */
  searchForUsers(params: SearchUsersOptions): Promise<AxiosResponse> {
    // Filter out SYSTEM_USER from userId param
    const userIds = params.userId?.filter(id => id !== null && id !== SYSTEM_USER);
    // Drop userId param if it only contains the system user or assign back to params object, without duplicates
    if (userIds) {
      if (userIds.length === 0) {
        delete params.userId;
      }
      else {
        params.userId = [...new Set(userIds)];
      }
    }


    if (Object.keys(params).length) {
      return comsAxios().get(`${PATH}`, { params: params });
    } else {
      return Promise.resolve({ data: [] } as AxiosResponse);
    }
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
