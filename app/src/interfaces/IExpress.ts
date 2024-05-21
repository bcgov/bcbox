import * as core from 'express-serve-static-core';

import type { CurrentUser } from '../types/CurrentUser';

interface Query extends core.Query {}

interface Params extends core.ParamsDictionary {}

export interface Request<P extends Params = never, Q extends Query = never, B = never> extends core.Request {
  currentUser?: CurrentUser;
  params: P;
  query: Q;
  body: B;
}

export interface Response extends core.Response {}

export interface NextFunction extends core.NextFunction {}
