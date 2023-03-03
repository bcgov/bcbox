import { comsAxios } from './interceptors';

import type {
  BucketAddPermissionsOptions,
  BucketDeletePermissionsOptions,
  BucketGetPermissionsOptions,
  BucketSearchPermissionsOptions,
  ObjectAddPermissionsOptions,
  ObjectDeletePermissionsOptions,
  ObjectGetPermissionsOptions,
  ObjectSearchPermissionsOptions
} from '@/types';

const PATH = 'permission';
const BUCKET = 'bucket';
const OBJECT = 'object';

export default {
  /**
   * @function bucketAddPermissions
   * Adds the given permissions to the bucket
   * @param {string} bucketId ID of the bucket to add permissions to
   * @param {Array<BucketAddPermissionsOptions>} data Array containing permissions to add
   * @returns {Promise} An axios response
   */
  bucketAddPermissions(bucketId: string, data: Array<BucketAddPermissionsOptions>) {
    return comsAxios().put(`${PATH}/${BUCKET}/${bucketId}`, data);
  },

  /**
   * @function bucketDeletePermission
   * Deletes the given permission from the bucket
   * @param {string} bucketId ID of the bucket to remove permissions from
   * @param {BucketDeletePermissionsOptions} params Object containing the permission to remove
   * @returns {Promise} An axios response
   */
  bucketDeletePermission(bucketId: string, params: BucketDeletePermissionsOptions) {
    return comsAxios().delete(`${PATH}/${BUCKET}/${bucketId}`, {
      params: params,
    });
  },

  /**
   * @function bucketSearchPermissions
   * Returns a list of bucket permissions
   * @param {BucketSearchPermissionsOptions} params Optional object containing the data to filter against
   * @returns {Promise} An axios response
   */
  bucketSearchPermissions(params?: BucketSearchPermissionsOptions) {
    return comsAxios().get(`${PATH}/${BUCKET}`, { params: params });
  },

  /**
   * @function bucketGetPermissions
   * Returns a list of permissions for the bucket
   * @param {string} objectId ID of the bucket
   * @param {BucketGetPermissionsOptions} params Optional object containing the data to filter against
   * @returns {Promise} An axios response
   */
  bucketGetPermissions(bucketId: string, params?: BucketGetPermissionsOptions) {
    return comsAxios().get(`${PATH}/${OBJECT}/${bucketId}`, { params: params });
  },

  /**
   * @function objectAddPermissions
   * Adds the given permissions to the object
   * @param {string} objectId ID of the object to add permissions to
   * @param {Array<ObjectAddPermissionsOptions>} data Array containing permissions to add
   * @returns {Promise} An axios response
   */
  objectAddPermissions(objectId: string, data: Array<ObjectAddPermissionsOptions>) {
    return comsAxios().put(`${PATH}/${OBJECT}/${objectId}`, data);
  },

  /**
 * @function objectDeletePermission
 * Deletes the given permission from the object
 * @param {string} objectId ID of the object to remove permissions from
 * @param {ObjectDeletePermissionsOptions} params Object containing the permission to remove
 * @returns {Promise} An axios response
 */
  objectDeletePermission(objectId: string, params: ObjectDeletePermissionsOptions) {
    return comsAxios().delete(`${PATH}/${OBJECT}/${objectId}`, { params: params });
  },

  /**
   * @function objectSearchPermissions
   * Returns a list of object permissions
   * @param {ObjectSearchPermissionsOptions} params Optional object containing the data to filter against
   * @returns {Promise} An axios response
   */
  objectSearchPermissions(params?: ObjectSearchPermissionsOptions) {
    return comsAxios().get(`${PATH}/${OBJECT}`, { params: params });
  },

  /**
   * @function objectGetPermissions
   * Returns a list of permissions for the object
   * @param {string} objectId ID of the object
   * @param {ObjectGetPermissionsOptions} params Optional object containing the data to filter against
   * @returns {Promise} An axios response
   */
  objectGetPermissions(objectId: string, params?: ObjectGetPermissionsOptions) {
    return comsAxios().get(`${PATH}/${OBJECT}/${objectId}`, { params: params });
  },
};
