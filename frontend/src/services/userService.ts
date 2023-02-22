import { comsAxios } from './interceptors';
const PATH = 'user';

export default {
  /**
   * @function searchForUsers
   * Returns a list of users based on the provided filtering parameters
   * @param {object} params Object containing the data to filter against
   * @returns {Promise} An axios response
   */
  searchForUsers(params: object) {
    return comsAxios().get(`${PATH}`, { params: params });
  },

  /**
   * @function listIdps
   * Fetch identity providers
   * @returns {Promise} An axios response
   */
  listIdps() {
    return comsAxios().get(`${PATH}/idpList`);
  },
};
