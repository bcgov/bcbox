import { comsAxios } from './interceptors';
const PATH = 'bucket';

export default {
  /**
   * @function searchForBuckets
   * Returns a list of buckets
   * @returns {Promise} An axios response
   */
  searchForBuckets() {
    return comsAxios().get(`${PATH}`);
  },
};
