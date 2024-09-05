import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class ExtractTokenMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const excludePaths = [
      { method: 'GET', path: '/users' }, // Exclude GET /users
      { method: 'POST', path: '/auth/login' }, // Exclude POST /auth/login
      { method: 'POST', path: '/auth/register' }, // Exclude POST /auth/register
    ];

    const isExcluded = excludePaths.some(
      (route) => route.method === req.method && req.path === route.path,
    );

    if (isExcluded) {
      return next();
    }

    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token no proporcionado' });
    }

    req['token'] = token; // Attach token to request object
    next();
  }
}
