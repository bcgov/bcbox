import { comsAxios } from './interceptors';
const BUCKET_PATH = 'bucket';
const BUCKET_PERMISSION_PATH = 'permission/bucket';

export default {
  /**
   * @function searchForBuckets
   * Returns a list of buckets
   * @returns {Promise} An axios response
   */
  searchForBuckets() {
    return comsAxios().get(`${BUCKET_PATH}`);
  },

  searchForPermissions(params: Object) {
    return comsAxios().get(`${BUCKET_PERMISSION_PATH}`, { params });
  },

  addPermissions(bucketId: string, data: Array<Object>) {
    return comsAxios().put(`${BUCKET_PERMISSION_PATH}/${bucketId}`, data);
  },

  deletePermission(bucketId: string, params: Object) {
    return comsAxios().delete(`${BUCKET_PERMISSION_PATH}/${bucketId}`, { params });
  },
};
