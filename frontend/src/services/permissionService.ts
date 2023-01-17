import { comsAxios } from './interceptors';

const PATH = 'permission';
const BUCKET = 'bucket';
const OBJECT = 'object';

export default {
  /**
   * @function bucketAddPermissions
   * Adds the given permissions to the bucket
   * @param {string} bucketId ID of the bucket to add permissions to
   * @param {Array<Object>} data Array containing permissions to add
   * @returns {Promise} An axios response
   */
  bucketAddPermissions(bucketId: string, data: Array<Object>) {
    return comsAxios().put(`${PATH}/${BUCKET}/${bucketId}`, data);
  },

  /**
 * @function bucketDeletePermission
 * Deletes the given permission from the bucket
 * @param {string} bucketId ID of the bucket to remove permissions from
 * @param {Object} params Object containing the permission to remove
 * @returns {Promise} An axios response
 */
  bucketDeletePermission(bucketId: string, params: Object) {
    return comsAxios().delete(`${PATH}/${BUCKET}/${bucketId}`, { params: params });
  },

  /**
     * @function bucketSearchPermissions
     * Returns a list of permissions for the bucket
     * @param {Object} params Optional object containing the data to filter against
     * @returns {Promise} An axios response
     */
  bucketSearchPermissions(params?: Object) {
    return comsAxios().get(`${PATH}/${BUCKET}`, { params: params });
  },

  /**
     * @function objectSearchPermissions
     * Returns a list of permissions for the object
     * @param {Object} params Optional object containing the data to filter against
     * @returns {Promise} An axios response
     */
  objectSearchPermissions(params?: Object) {
    return comsAxios().get(`${PATH}/${OBJECT}`, { params: params });
  },

  /**
     * @function objectGetPermissions
     * Returns a list of permissions for the object
     * @param {string} objectId ID of the object
     * @param {Object} params Optional object containing the data to filter against
     * @returns {Promise} An axios response
     */
  objectGetPermissions(objectId: string, params?: Object) {
    return comsAxios().get(`${PATH}/${OBJECT}/${objectId}`, { params: params });
  },
};
