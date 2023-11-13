import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { ClientError } from './client-error.js';

const hashKey = process.env.TOKEN_SECRET;
if (!hashKey) throw new Error('TOKEN_SECRET not found in .env');

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const auth = req.headers.authorization;
  const token = auth?.split('Bearer ')[1];
  if (!token) throw new ClientError(401, 'authentication required');
  req.user = jwt.verify(token, hashKey ?? '') as Request['user'];
  next();
}
