import { comsAxios } from './interceptors';
const PATH = '/object';
const OBJECT_PERMISSION_PATH = 'permission/object';

export default {
  // ------------------------------------------------------------
  // Object
  // ------------------------------------------------------------
  /**
   * @function createObject
   * Post an object
   * @returns {Promise} An axios response
   */
  createObject(object: any, bucketId?: string) {
    const config = {
      headers: { 'Content-Type': 'multipart/form-data' },
      params: { bucketId: bucketId },
    };
    const fd = new FormData();
    fd.append('file', object);
    return comsAxios().post(PATH, fd, config);
  },

  /**
   * @function deleteObject
   * Delete an object
   * @returns {Promise} An axios response
   */
  deleteObject(objectId: string) {
    return comsAxios().delete(`${PATH}/${objectId}`);
  },

  /**
   * @function getMetadata
   * Get an object's metadata
   * @returns {Promise} An axios response
   */
  getMetadata(headers: any = {}, params: any = {}) {
    // remove objId array if its first element is undefined
    if (params.objId && params.objId[0] === undefined) delete params.objId;
    return comsAxios().get(`${PATH}/metadata`, { headers: headers, params: params });
  },

  /**
   * @function getObjectTagging
   * Get an objects tags
   * @returns {Promise} An axios response
   */
  getObjectTagging(params: any = {}) {
    return comsAxios().get(`${PATH}/tagging`, { params: params });
  },

  /**
   * @function getObject
   * Get an object
   * @param objectId The id for the object to get
   * @param versionId An optional versionId
   */
  getObject(objectId: string, versionId?: string) {
    // Running in 'url' download mode only, could add options for other modes if needed
    comsAxios()
      .get(`${PATH}/${objectId}`, {
        params: {
          versionId: versionId,
          download: 'url',
        },
      })
      .then((response) => {
        const url = response.data;
        window.open(url, '_blank');
      });
  },

  /**
   * @function listObjects
   * List and search for all objects
   * @returns {Promise} An axios response
   */
  listObjects(params: any = {}) {
    // remove objId array if its first element is undefined
    if (params.objId && params.objId[0] === undefined) delete params.objId;
    return comsAxios().get(PATH, { params: params });
  },

  /**
   * @function readObject
   * Get an object details (head call)
   * @param objectId The id for the object to get
   * @returns {Promise} An axios response
   */
  readObject(objectId: string) {
    return comsAxios().head(`${PATH}/${objectId}`);
  },

  /**
   * @function togglePublic
   * Toggles the public property for an object
   * @param objectId The id for the object
   * @param isPublic Boolean on public status
   * @returns {Promise} An axios response
   */
  togglePublic(objectId: string, isPublic: boolean) {
    return comsAxios().patch(`${PATH}/${objectId}/public`, null, {
      params: {
        public: isPublic,
      },
    });
  },

  /**
   * @function updateObject
   * Update the object record (will add new version)
   * @returns {Promise} An axios response
   */
  updateObject(objectId: string, object: any) {
    const config = { headers: { 'Content-Type': 'multipart/form-data' } };
    const fd = new FormData();
    fd.append('file', object);
    return comsAxios().post(`${PATH}/${objectId}`, fd, config);
  },


  /**
   * @function addPermissions
   * Adds the given permissions to the object
   * @param {string} objectId ID of the object to add permissions to
   * @param {Array<Object>} data Array containing permissions to add
   * @returns {Promise} An axios response
   */
  addPermissions(objectId: string, data: Array<Object>) {
    return comsAxios().put(`${OBJECT_PERMISSION_PATH}/${objectId}`, data);
  },

  /**
 * @function deletePermission
 * Deletes the given permission from the object
 * @param {string} objectId ID of the object to remove permissions from
 * @param {Object} params Object containing the permission to remove
 * @returns {Promise} An axios response
 */
  deletePermission(objectId: string, params: Object) {
    return comsAxios().delete(`${OBJECT_PERMISSION_PATH}/${objectId}`, { params: params });
  },
  // -----------------------------------------------------/object
};
