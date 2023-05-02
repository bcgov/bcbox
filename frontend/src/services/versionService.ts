import { comsAxios } from './interceptors';

import type { GetVersionMetadataOptions, GetVersionTaggingOptions } from '@/types';

const PATH = '/version';

export default {
  /**
   * @function getMetadata
   * Get an object's metadata
   * @returns {Promise} An axios response
   */
  getMetadata(headers: any = {}, params: GetVersionMetadataOptions) {
    return comsAxios().get(`${PATH}/metadata`, { headers: headers, params: params });
  },

  /**
   * @function getObjectTagging
   * Get an objects tags
   * @returns {Promise} An axios response
   */
  getObjectTagging(params: GetVersionTaggingOptions) {
    return comsAxios().get(`${PATH}/tagging`, { params: params });
  },
};
