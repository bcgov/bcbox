import jwt from 'jsonwebtoken';

export type CurrentUser = {
  tokenPayload: string | jwt.JwtPayload | null;
};
