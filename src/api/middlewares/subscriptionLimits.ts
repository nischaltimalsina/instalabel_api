import { Request, Response, NextFunction } from 'express';
import { UsageTrackingService } from '../../domain/services/usageTrackingService';
import { AppError } from './errorHandler';

const usageTrackingService = new UsageTrackingService();

export const checkUserLimit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      throw new AppError('Tenant ID is required', 400);
    }

    const withinLimit = await usageTrackingService.checkUserLimit(tenantId);
    if (!withinLimit) {
      throw new AppError('User limit reached for your subscription plan', 403);
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const checkRecipeLimit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      throw new AppError('Tenant ID is required', 400);
    }

    const withinLimit = await usageTrackingService.checkRecipeLimit(tenantId);
    if (!withinLimit) {
      throw new AppError('Recipe limit reached for your subscription plan', 403);
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const checkLabelLimit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      throw new AppError('Tenant ID is required', 400);
    }

    const withinLimit = await usageTrackingService.checkLabelLimit(tenantId);
    if (!withinLimit) {
      throw new AppError('Monthly label limit reached for your subscription plan', 403);
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const checkFeatureAccess = (feature: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantId = req.user?.tenantId;
      if (!tenantId) {
        throw new AppError('Tenant ID is required', 400);
      }

      const hasAccess = await usageTrackingService.checkFeatureAccess(tenantId, feature);
      if (!hasAccess) {
        throw new AppError(`This feature (${feature}) is not available on your current plan`, 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
