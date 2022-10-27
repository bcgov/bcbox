import { appAxios } from './interceptors';

export default {
  /**
   * @function getHello
   * Fetch the contents of the hello endpoint
   * @returns {Promise} An axios response
   */
  getHello() {
    return appAxios().get('api/hello');
  },
};
