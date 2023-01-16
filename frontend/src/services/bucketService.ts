import { comsAxios } from './interceptors';
const BUCKET_PATH = 'bucket';


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
};
