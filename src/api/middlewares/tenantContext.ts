import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

// Middleware to ensure tenant context is present
export const ensureTenantContext = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // If no user or tenantId, deny access
  if (!req.user || !req.user.tenantId) {
    return next(new AppError('Tenant context is required', 403));
  }

  next();
};

// Middleware to set tenant ID from route parameter
export const setTenantFromParam = (paramName: string = 'tenantId') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const tenantId = req.params[paramName];

    if (!tenantId) {
      return next(new AppError(`Tenant ID parameter (${paramName}) is required`, 400));
    }

    // If user has a different tenantId and is not a super admin, deny access
    if (req.user?.tenantId &&
        req.user.tenantId !== tenantId &&
        req.user.role !== 'admin') {
      return next(new AppError('You do not have permission to access this tenant', 403));
    }

    // Set or override tenant ID in user object
    if (!req.user) {
      req.user = { id: '', tenantId };
    } else {
      req.user.tenantId = tenantId;
    }

    next();
  };
};
