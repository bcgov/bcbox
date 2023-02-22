import { comsAxios } from './interceptors';

const PATH = 'permission';
const BUCKET = 'bucket';
const OBJECT = 'object';

export default {
  /**
   * @function bucketAddPermissions
   * Adds the given permissions to the bucket
   * @param {string} bucketId ID of the bucket to add permissions to
   * @param {Array<object>} data Array containing permissions to add
   * @returns {Promise} An axios response
   */
  bucketAddPermissions(bucketId: string, data: Array<object>) {
    return comsAxios().put(`${PATH}/${BUCKET}/${bucketId}`, data);
  },

  /**
   * @function bucketDeletePermission
   * Deletes the given permission from the bucket
   * @param {string} bucketId ID of the bucket to remove permissions from
   * @param {object} params Object containing the permission to remove
   * @returns {Promise} An axios response
   */
  bucketDeletePermission(bucketId: string, params: object) {
    return comsAxios().delete(`${PATH}/${BUCKET}/${bucketId}`, {
      params: params,
    });
  },

  /**
   * @function bucketSearchPermissions
   * Returns a list of bucket permissions
   * @param {object} params Optional object containing the data to filter against
   * @returns {Promise} An axios response
   */
  bucketSearchPermissions(params?: object) {
    return comsAxios().get(`${PATH}/${BUCKET}`, { params: params });
  },

  /**
   * @function objectAddPermissions
   * Adds the given permissions to the object
   * @param {string} objectId ID of the object to add permissions to
   * @param {Array<object>} data Array containing permissions to add
   * @returns {Promise} An axios response
   */
  objectAddPermissions(objectId: string, data: Array<object>) {
    return comsAxios().put(`${PATH}/${OBJECT}/${objectId}`, data);
  },

  /**
 * @function objectDeletePermission
 * Deletes the given permission from the object
 * @param {string} objectId ID of the object to remove permissions from
 * @param {object} params Object containing the permission to remove
 * @returns {Promise} An axios response
 */
  objectDeletePermission(objectId: string, params: object) {
    return comsAxios().delete(`${PATH}/${OBJECT}/${objectId}`, { params: params });
  },

  /**
   * @function objectSearchPermissions
   * Returns a list of object permissions
   * @param {object} params Optional object containing the data to filter against
   * @returns {Promise} An axios response
   */
  objectSearchPermissions(params?: object) {
    return comsAxios().get(`${PATH}/${OBJECT}`, { params: params });
  },

  /**
   * @function objectGetPermissions
   * Returns a list of permissions for the object
   * @param {string} objectId ID of the object
   * @param {object} params Optional object containing the data to filter against
   * @returns {Promise} An axios response
   */
  objectGetPermissions(objectId: string, params?: object) {
    return comsAxios().get(`${PATH}/${OBJECT}/${objectId}`, { params: params });
  },
};
