import express from 'express';
// @ts-expect-error api-problem lacks a defined interface; code still works fine
import Problem from 'api-problem';

import type { Express, Request, Response } from 'express';

/**
 * @class helper
 * Provides helper utilities that are commonly used in tests
 */
const helper = {
  /**
   * @function expressHelper
   * Creates a stripped-down simple Express server object
   * @param {string} basePath The path to mount the `router` on
   * @param {object} router An express router object to mount
   * @returns {object} A simple express server object with `router` mounted to `basePath`
   */
  expressHelper: (basePath: string, router: Express): object => {
    const app = express();

    app.use(express.json());
    app.use(
      express.urlencoded({
        extended: false
      })
    );
    app.use(basePath, router);

    // Handle 500
    // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
    app.use((err: Problem, _req: Request, res: Response, _next: () => void): void => {
      if (err instanceof Problem) {
        err.send(res);
      } else {
        new Problem(500, {
          details: err.message ? err.message : err
        }).send(res);
      }
    });

    // Handle 404
    app.use((_req, res) => {
      new Problem(404).send(res);
    });

    return app;
  }
};

export default helper;
