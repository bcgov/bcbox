import config from 'config';
import emailService from '../services/email';

import type { NextFunction, Request, Response } from '../interfaces/IExpress';
import { Email } from '../types';

const controller = {
  /**
   * @function send
   * Send email using CHES API
   * https://ches.api.gov.bc.ca/api/v1/docs#tag/EmailMerge/operation/postMerge
   */
  send: async (req: Request<never, never, Email>, res: Response, next: NextFunction) => {
    try {
      req.body.from = config.get('server.ches.from');
      req.body.bodyType = 'html';
      const { data, status } = await emailService.emailMerge(req.body);

      res.status(status).json(data);
    } catch (e: unknown) {
      next(e);
    }
  }
};

export default controller;
