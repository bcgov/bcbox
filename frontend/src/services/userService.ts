import { comsAxios } from './interceptors';
const PATH = 'user';

export default {
  /**
   * @function searchForUsers
   * Returns a list of users based on the provided filtering parameters
   * @returns {Promise} An axios response
   */
  searchForUsers(params: Object) {
    return comsAxios().get(`${PATH}`, { params });
  },

  /**
   * @function listIdps
   * Fetch identity providers
   * @returns {Promise} An axios response
   */
  listIdps() {
    return comsAxios().get(`${PATH}/idpList`);
  },

  /**
   * @function testBad
   * Fetch identity providers
   * @returns {Promise} An axios response
   */
  testBad() {
    return comsAxios().get(`${PATH}/sdfsdfsd`);
  },
};
