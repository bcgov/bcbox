import { comsAxios } from './interceptors';

const PATH = 'permission/invite';

export default {
  /**
   * @function createInvite
   * Post an Invite, exclusive or on bucketId and objectId
   * @param {string} bucketId
   * @param {string} objectId
   * @param {string} email to be used for access
   * @param {string} expiration timestamp for token
   * @returns {string} uuid token of the invite
   * @returns {array} permCodes token of the invite
   */
  createInvite(bucketId?: string, email?: string, expiresAt?: number, objectId?: string, permCodes?: Array<string>) {
    return comsAxios().post(`${PATH}`, {
      bucketId: bucketId || undefined,
      email: email || undefined,
      expiresAt: expiresAt || undefined,
      objectId: objectId || undefined,
      permCodes: permCodes || undefined
    });
  },

  /**
   * @function getInvite
   * Use an invite token
   * @param {string} token uuid
   * @returns {Promise} An axios response
   */
  getInvite(token: string): Promise<any> {
    return comsAxios().get(`${PATH}/${token}`);
  }
};
