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
   * @function createBucketChild
   * Creates a bucket
   * @param {string} parentBucketId ID of parent COMS 'bucket'
   * @param {string} subKey 'sub-folder' name (last part of the key)
   * @param {string} bucketName Display name for the mapped sub-folder
   * @returns {Promise} An axios response
   */
  createBucketChild(parentBucketId: string, subKey: string, bucketName: string) {
    return comsAxios().put(`${BUCKET_PATH}/${parentBucketId}/child`, { subKey, bucketName });
  },

  /**
   * @function deleteBucket
   * Deletes a bucket and optionally sub-folders
   * This is a COMS DB delete only. The S3 bucket(s) remains intact
   * @param {string} bucketId Bucket ID for the bucket to delete
   * @returns {Promise} An axios response
   */
  deleteBucket(bucketId: string, recursive: boolean ) {
    return comsAxios().delete(`${BUCKET_PATH}/${bucketId}`, {
      params: {
        recursive: recursive,
      }
    });
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
  syncBucket(bucketId: string, recursive: boolean ) {
    return comsAxios().get(`${BUCKET_PATH}/${bucketId}/sync`, {
      params: {
        recursive: recursive,
      }
    });
  }
};
