import { comsAxios } from './interceptors';
const BUCKET_PATH = 'bucket';
const BUCKET_PERMISSION_PATH = 'permission/bucket';

export default {
  /**
   * @function searchForBuckets
   * Returns a list of buckets
   * @param {Object} params Optional object containing the data to filter against
   * @returns {Promise} An axios response
   */
  searchForBuckets(params?: Object) {
    return comsAxios().get(`${BUCKET_PATH}`, { params: params });
  },

  /**
   * @function searchForPermissions
   * Returns a list of permissions for the bucket
   * @param {Object} params Optional object containing the data to filter against
   * @returns {Promise} An axios response
   */
  searchForPermissions(params?: Object) {
    return comsAxios().get(`${BUCKET_PERMISSION_PATH}`, { params: params });
  },

  /**
   * @function addPermissions
   * Adds the given permissions to the bucket
   * @param {string} bucketId ID of the bucket to add permissions to
   * @param {Array<Object>} data Array containing permissions to add
   * @returns {Promise} An axios response
   */
  addPermissions(bucketId: string, data: Array<Object>) {
    return comsAxios().put(`${BUCKET_PERMISSION_PATH}/${bucketId}`, data);
  },

  /**
 * @function deletePermission
 * Deletes the given permission from the bucket
 * @param {string} bucketId ID of the bucket to remove permissions from
 * @param {Object} params Object containing the permission to remove
 * @returns {Promise} An axios response
 */
  deletePermission(bucketId: string, params: Object) {
    return comsAxios().delete(`${BUCKET_PERMISSION_PATH}/${bucketId}`, { params: params });
  },
};
