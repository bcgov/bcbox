import { comsAxios } from './interceptors';
import ConfigService from './configService';

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
const IDP = 'idp';

export default {
  // ------ user permissions ------
  /**
   * @function bucketAddPermissions
   * Adds the given permissions to the bucket
   * @param {string} bucketId ID of the bucket to add permissions to
   * @param {Array<BucketAddPermissionsOptions>} data Array containing permissions to add
   * @returns {Promise} An axios response
   */
  bucketAddPermissions(bucketId: string, data: Array<BucketAddPermissionsOptions>, params = { recursive: false }) {
    return comsAxios().put(`${PATH}/${BUCKET}/${bucketId}`, data, {
      params: params
    });
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
      params: params
    });
  },

  /**
   * @function bucketSearchPermissions
   * Returns a list of bucket permissions
   * @param {BucketSearchPermissionsOptions} params Optional object containing the data to filter against
   * @returns {Promise} An axios response
   */
  async bucketSearchPermissions(params: BucketSearchPermissionsOptions) {
    // Normalize bucketId to an array if it's a string
    if (params.bucketId && typeof params.bucketId === 'string') params.bucketId = [params.bucketId];
    if (params.bucketId && params.bucketId[0] === undefined) delete params.bucketId;

    // if searching with more than one bucketId, but only one userId
    if (
      params.bucketId &&
      params.bucketId.length > 1 &&
      (Array.isArray(params.userId) ? params.userId.length === 1 : true)
    ) {
      /**
       * split calls to COMS if query params (eg bucketId's)
       * will cause url length to excede 2000 characters
       * see: https://stackoverflow.com/questions/417142/what-is-the-maximum-length-of-a-url-in-different-browsers
       */
      let urlLimit = 2000;

      const baseUrl = new URL(`${new ConfigService().getConfig().coms.apiPath}${PATH}/${BUCKET}`).toString();
      urlLimit -= baseUrl.length;

      // account for string or boolean query params
      if (params.userId) urlLimit -= '&userId[]='.length + 36;
      if (params.permCode) urlLimit -= 80;
      if (params.objectPerms) urlLimit -= '&objectPerms=false'.length;

      // account for bucketId param
      const BUCKET_ID_PARAM_LENGTH = '&bucketId[]='.length + 36; // uuidv4's have 36 chars, including dashes
      const groupSize = Math.floor(urlLimit / BUCKET_ID_PARAM_LENGTH);

      // loop through each group and push COMS result to `groups` array
      const iterations = Math.ceil(params.bucketId.length / groupSize);
      const groups = [];

      // loop through each group and push COMS result to `groups` array
      for (let i = 0; i < iterations; i++) {
        const bucketIds = params.bucketId.slice(i * groupSize, i * groupSize + groupSize);
        groups.push(
          // if server load becomes an issue, change these parallel calls to sequential ones
          comsAxios().get(`${PATH}/${BUCKET}`, {
            params: {
              ...params,
              bucketId: bucketIds
            }
          })
        );
      }
      const responses = await Promise.all(groups);
      return {
        data: responses.flatMap((r) => r.data)
      };
    }
    // else just call COMS once
    else {
      return comsAxios().get(`${PATH}/${BUCKET}`, { params });
    }
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

  // ------ IDP permissions ------

  /**
   * function bucketAddIdpPermissions
   * Adds the given permissions to the bucket for the specified IDP
   * @param bucketId
   * @param data
   * @param params
   * @returns
   */
  bucketAddIdpPermissions(bucketId: string, data: any, params = { recursive: false }) {
    return comsAxios().put(`${PATH}/${IDP}/${BUCKET}/${bucketId}`, data, {
      params: params
    });
  },

  /**
   * function bucketDeleteIdpPermission
   * Deletes the given permission from the bucket for the specified IDP
   * @param bucketId
   * @param params
   * @returns
   */
  bucketDeleteIdpPermission(bucketId: string, params: any) {
    return comsAxios().delete(`${PATH}/${IDP}/${BUCKET}/${bucketId}`, {
      params: params
    });
  },

  /**
   * @function bucketSearchIdpPermissions
   * Returns a list of buckets and their IDP permissions
   * @param {BucketSearchPermissionsOptions} params Optional object containing the data to filter agai
   * @returns {Promise} An axios response
   */
  async bucketSearchIdpPermissions(params?: any) {
    // Normalize bucketId to an array if it's a string
    if (params.bucketId && typeof params.bucketId === 'string') params.bucketId = [params.bucketId];
    // if searching with more than one bucketId, but only one idp
    if (
      params.bucketId &&
      params.bucketId.length > 1 &&
      (Array.isArray(params.idp) ? params.idp.length === 1 : true) &&
      1 > 2
    ) {
      /**
       * split calls to COMS if query params (eg bucketId's)
       * will cause url length to excede 2000 characters
       * see: https://stackoverflow.com/questions/417142/what-is-the-maximum-length-of-a-url-in-different-browsers
       */
      let urlLimit = 2000;

      const baseUrl = new URL(`${new ConfigService().getConfig().coms.apiPath}${PATH}/${IDP}/${BUCKET}`).toString();
      urlLimit -= baseUrl.length;

      // account for string or boolean query params
      if (params.idp) urlLimit -= '&idp[]='.length + 255; // max idp length
      if (params.permCode !== undefined) urlLimit -= 80;
      if (params.objectPerms) urlLimit -= '&objectPerms=false'.length;

      // account for bucketId param
      const BUCKET_ID_PARAM_LENGTH = '&bucketId[]='.length + 36; // uuidv4's have 36 chars, including dashes
      const groupSize = Math.floor(urlLimit / BUCKET_ID_PARAM_LENGTH);

      // loop through each group and push COMS result to `groups` array
      const iterations = Math.ceil(params.bucketId.length / groupSize);
      const groups = [];

      // loop through each group and push COMS result to `groups` array
      for (let i = 0; i < iterations; i++) {
        const bucketIds = params.bucketId.slice(i * groupSize, i * groupSize + groupSize);
        groups.push(
          // if server load becomes an issue, change these parallel calls to sequential ones
          comsAxios().get(`${PATH}/${IDP}/${BUCKET}`, {
            params: {
              ...params,
              bucketId: bucketIds
            }
          })
        );
      }
      const responses = await Promise.all(groups);
      return {
        data: responses.flatMap((r) => r.data)
      };
    }
    // else just call COMS once
    else {
      return comsAxios().get(`${PATH}/${IDP}/${BUCKET}`, { params: params });
    }
  },

  /**
   * function bucketGetIdpPermissions
   * Returns a list of IDP permissions for the bucket
   * @param bucketId
   * @param params
   * @returns
   */
  bucketGetIdpPermissions(bucketId: string, params?: any) {
    return comsAxios().get(`${PATH}/${IDP}/${BUCKET}/${bucketId}`, { params: params });
  },

  /**
   * function objectAddIdpPermissions
   * Adds the given permissions to the object for the specified IDP
   * @param objectId
   * @param data
   * @returns
   */
  objectAddIdpPermissions(objectId: string, data: Object) {
    return comsAxios().put(`${PATH}/${IDP}/${OBJECT}/${objectId}`, data);
  },

  /**
   * @function objectDeleteIdpPermission
   * Deletes the given IDP permission from the object
   * @param {string} objectId ID of the object to remove permissions from
   * @param {ObjectDeletePermissionsOptions} params Object containing the permission to remove
   * @returns {Promise} An axios response
   */
  objectDeleteIdpPermission(objectId: string, params: Object) {
    return comsAxios().delete(`${PATH}/${IDP}/${OBJECT}/${objectId}`, { params: params });
  },

  /**
   * @function objectSearchIdpPermissions
   * Returns a list of IDP object permissions
   * @param {ObjectSearchPermissionsOptions} params Optional object containing the data to filter against
   * @returns {Promise} An axios response
   */
  objectSearchIdpPermissions(params?: any) {
    return comsAxios().get(`${PATH}/${IDP}/${OBJECT}`, { params: params });
  },

  /**
   * @function objectGetIdpPermissions
   * Returns a list of IDP permissions for the object
   * @param {string} objectId ID of the object
   * @param {ObjectGetPermissionsOptions} params Optional object containing the data to filter against
   * @returns {Promise} An axios response
   */
  objectGetIdpPermissions(objectId: string, params?: Object) {
    return comsAxios().get(`${PATH}/${IDP}/${OBJECT}/${objectId}`, { params: params });
  }
};
