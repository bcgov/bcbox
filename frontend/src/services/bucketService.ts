import { comsAxios } from './interceptors';

import type { Bucket, SearchBucketsOptions } from '@/types';

const BUCKET_PATH = 'bucket';

export default {
  /**
   * @function searchForBuckets
   * Returns a list of buckets
   * @param {SearchBucketsOptions} params Optional object containing the data to filter against
   * @returns {Promise} An axios response
   */
  searchBuckets(params?: SearchBucketsOptions) {
    return comsAxios().get(`${BUCKET_PATH}`, { params: params });
  },

  /**
   * @function createBucket
   * Creates a bucket
   * @param {Bucket} data Bucket object containing the data to create bucket
   * @returns {Promise} An axios response
   */
  createBucket(data: Bucket) {
    return comsAxios().put(`${BUCKET_PATH}`, data);
  },

  /**
   * @function deleteBucket
   * Deletes a bucket
   * This is a COMS DB delete only. The S3 bucket remains intact
   * @param {string} bucketId Bucket ID for the bucket to delete
   * @returns {Promise} An axios response
   */
  deleteBucket(bucketId: string) {
    return comsAxios().delete(`${BUCKET_PATH}/${bucketId}`);
  },

  /**
   * @function updateBucket
   * Updates a bucket
   * @param {Bucket} data Bucket object containing the data to update bucket
   * @returns {Promise} An axios response
   */
  updateBucket(bucketId: string, data: Bucket) {
    return comsAxios().patch(`${BUCKET_PATH}/${bucketId}`, data);
  },

  /**
   * @function syncBucket
   * Synchronizes a bucket
   * @param {string} bucketId Bucket ID for the bucket to synchronize
   * @returns {Promise} An axios response
   */
  syncBucket(bucketId: string) {
    return comsAxios().get(`${BUCKET_PATH}/${bucketId}/sync`);
  }
};
