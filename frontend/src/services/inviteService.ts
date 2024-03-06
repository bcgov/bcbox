import { comsAxios } from './interceptors';

import type { InviteCreateOptions } from '@/types';

const PATH = 'permission/invite';

export default {
  /**
   * @function getInvite
   * Use an invite token
   * @returns {Promise} An axios response
   */
  createInvite(params: InviteCreateOptions): Promise<string> {
    return comsAxios().get(`${PATH}`, {
      params: params
    });
  },

  /**
   * @function getInvite
   * Use an invite token
   * @returns {Promise} An axios response
   */
  getInvite(token: string): Promise<any> {
    return comsAxios().get(`${PATH}/${token}`);
  }
};
