import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import environment from '../../config/environment';
import { AppError } from './errorHandler';

// Extend Express Request interface to include user information
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        tenantId?: string;
        role?: string;
      };
    }
  }
}

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 1) Get token and check if it exists
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new AppError('You are not logged in. Please log in to get access.', 401);
    }

    // 2) Verify token
    try {
      const decoded = jwt.verify(token, environment.jwt.secret) as {
        id: string;
        tenantId?: string;
        role?: string;
        iat: number;
        exp: number;
      };

      // 3) Set user info in request object
      req.user = {
        id: decoded.id,
        tenantId: decoded.tenantId,
        role: decoded.role
      };

      next();
    } catch (error) {
      if ((error as Error).name === 'JsonWebTokenError') {
        throw new AppError('Invalid token. Please log in again.', 401);
      }
      if ((error as Error).name === 'TokenExpiredError') {
        throw new AppError('Your token has expired. Please log in again.', 401);
      }
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

// Middleware to restrict access to certain roles
export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('You are not logged in', 401));
    }

    if (!req.user.role || !roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }

    next();
  };
};
