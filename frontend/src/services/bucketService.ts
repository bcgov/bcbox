import ConfigService from './configService';
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
  async searchBuckets(params: SearchBucketsOptions) {
    if (params.bucketId && params.bucketId[0] === undefined) delete params.bucketId;

    // if searching with more than one objectId
    if (params.bucketId && params.bucketId.length > 1) {
      /**
       * split calls to COMS if query params (eg bucketId's)
       * will cause url length to excede 2000 characters
       * see: https://stackoverflow.com/questions/417142/what-is-the-maximum-length-of-a-url-in-different-browsers
       */
      let urlLimit = 2000;

      const baseUrl = new URL(`${new ConfigService().getConfig().coms.apiPath}${BUCKET_PATH}`).toString();
      urlLimit -= baseUrl.length;

      // account for query params
      if (params.active !== undefined) urlLimit -= '&active=false'.length;
      if (params.key) urlLimit -= `&key=${encodeURIComponent(params.key)}`.length;
      if (params.bucketName) urlLimit -= `&bucketName=${encodeURIComponent(params.bucketName)}`.length;

      // account for bucketId param
      const BUCKET_ID_PARAM_LENGTH = '&bucketId[]='.length + 36; // uuidv4's have 36 chars, including dashes
      const groupSize = Math.floor(urlLimit / BUCKET_ID_PARAM_LENGTH);

      // loop through each group and push COMS result to `groups` array
      const iterations = Math.ceil(params.bucketId.length / groupSize);
      const groups = [];

      // loop through each group and push COMS result to `groups` array
      for (let i = 0; i < iterations; i++) {
        const ids = params.bucketId.slice(i * groupSize, i * groupSize + groupSize);
        groups.push(
          // if server load becomes an issue, change these parallel calls to sequential ones
          comsAxios().get(BUCKET_PATH, { params: { ...params, bucketId: ids } })
        );
      }
      const responses = await Promise.all(groups);
      return {
        data: responses.flatMap((r) => r.data)
      };
    }
    // else just call COMS once
    else {
      return comsAxios().get(BUCKET_PATH, { params });
    }
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
  deleteBucket(bucketId: string, recursive: boolean) {
    return comsAxios().delete(`${BUCKET_PATH}/${bucketId}`, {
      params: {
        recursive: recursive
      }
    });
  },

  /**
   * @function getBucket
   * Get a bucket
   * @param {string} bucketId The id for the bucket to get
   * @returns {Promise} An axios response
   */
  fetchBucket(bucketId: string) {
    return comsAxios().get(`${BUCKET_PATH}/${bucketId}`);
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
   * @function togglePublic
   * Toggles the public property for a bucket
   * @param {string} bucketId The id for the bucket
   * @param {boolean} isPublic Boolean on public status
   * @returns {Promise} An axios response
   */
  togglePublic(bucketId: string, isPublic: boolean) {
    return comsAxios().patch(`${BUCKET_PATH}/${bucketId}/public`, null, {
      params: {
        public: isPublic
      },
      timeout: 60000
    });
  },

  /**
   * @function syncBucket
   * Synchronizes a bucket
   * @param {string} bucketId Bucket ID for the bucket to synchronize
   * @returns {Promise} An axios response
   */
  syncBucket(bucketId: string, recursive: boolean) {
    return comsAxios().get(`${BUCKET_PATH}/${bucketId}/sync`, {
      params: {
        recursive: recursive
      }
    });
  },

  /**
   * @function syncBucketStatus
   * get sync status for a folder
   * returns the number of objects in the given folder that remain in the COMS sync queue
   * @param {string} bucketId Bucket ID (folder)
   * @returns {Promise} An axios response
   */
  syncBucketStatus(params: { bucketId: string }) {
    return comsAxios().get('sync/status', { params: params });
  }
};
