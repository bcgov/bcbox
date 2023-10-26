import { comsAxios } from './interceptors';
import { excludeMetaTag } from '@/utils/utils';

import type { GetVersionMetadataOptions, GetVersionTaggingOptions } from '@/types';
import { ExcludeTypes } from '@/utils/enums';

const PATH = '/version';

export default {
  /**
   * @function getMetadata
   * Get an object's metadata
   * @returns {Promise} An axios response
   */
  getMetadata(headers: any = {}, params: GetVersionMetadataOptions) {
    return (
      comsAxios()
        .get(`${PATH}/metadata`, { headers: headers, params: params })
        // filter out a configured list of select metadata
        .then((response) => ({ data: excludeMetaTag(ExcludeTypes.METADATA, response.data) }))
    );
  },

  /**
   * @function getObjectTagging
   * Get an objects tags
   * @returns {Promise} An axios response
   */
  getObjectTagging(params: GetVersionTaggingOptions) {
    return (
      comsAxios()
        .get(`${PATH}/tagging`, { params: params })
        // filter out a configured list of select tags
        .then((response) => ({ data: excludeMetaTag(ExcludeTypes.TAGSET, response.data) }))
    );
  }
};
