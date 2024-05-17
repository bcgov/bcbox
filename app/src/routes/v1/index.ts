import { currentUser } from '../../middleware/authentication';
import express from 'express';

import { emailValidator } from '../../validators';
import emailController from '../../controllers/email';

import type { NextFunction, Request, Response } from '../../interfaces/IExpress';

const router = express.Router();

// incoming request (to backend) requires valid JWT of current user of front end app
router.use(currentUser);

router.post('/email', emailValidator.mergeSchema, (req: Request, res: Response, next: NextFunction): void => {
  emailController.send(req, res, next);
});

export default router;
