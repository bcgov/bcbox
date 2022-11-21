import { comsAxios } from './interceptors';
const PATH = '/object';

export default {
  // ------------------------------------------------------------
  // Object
  // ------------------------------------------------------------
  /**
   * @function createObject
   * Post an object
   * @returns {Promise} An axios response
   */
  createObject(object: any) {
    const config = { headers: { 'Content-Type': 'multipart/form-data' } };
    let fd = new FormData();
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
   * @function getObject
   * Get an object
   * @param objectId The id for the object to get
   * @param versionId An optional versionId
   */
  getObject(objectId: string, versionId?: string, download?: boolean) {
    if (download) {
      comsAxios()
        .get(`${PATH}/${objectId}`, {
          responseType: 'blob',
          params: {
            versionId: versionId,
            download: 'proxy',
          },
        })
        .then((response: any) => {
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', response.headers['x-amz-meta-name']);
          document.body.appendChild(link);
          link.click();
        });
    } else {
      // Get just the link to the unlocked object store entity and open it
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
    }
  },

  /**
   * @function listObjects
   * List and search for all objects
   * @returns {Promise} An axios response
   */
  listObjects(params: any = {}) {
    // remove objId array if its first element is undefined
    if (params.objId && params.objId[0] === undefined) delete params.objId;
    console.log(params);
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
    let fd = new FormData();
    fd.append('file', object);
    return comsAxios().post(`${PATH}/${objectId}`, fd, config);
  },
  // -----------------------------------------------------/object
};
