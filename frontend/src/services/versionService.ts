import { comsAxios } from './interceptors';
import { s3MetaTagExclude } from '@/utils/utils';

import type { GetVersionMetadataOptions, GetVersionTaggingOptions } from '@/types';

const PATH = '/version';

export default {
  /**
   * @function getMetadata
   * Get an object's metadata
   * @returns {Promise} An axios response
   */
  getMetadata(headers: any = {}, params: GetVersionMetadataOptions) {
    return comsAxios().get(`${PATH}/metadata`, { headers: headers, params: params })
      // filter out a configured list of select metadata
      .then((response) => {
        return s3MetaTagExclude('metadata', response);
      });
  },

  /**
   * @function getObjectTagging
   * Get an objects tags
   * @returns {Promise} An axios response
   */
  getObjectTagging(params: GetVersionTaggingOptions) {
    return comsAxios().get(`${PATH}/tagging`, { params: params })
      // filter out a configured list of select tags
      .then((response) => {
        return s3MetaTagExclude('tagset', response);
      });
  },
};
