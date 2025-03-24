import { Request, Response, NextFunction } from 'express';
import { UsageTrackingService } from '../../domain/services/usageTrackingService';
import { AppError } from '../middlewares/errorHandler';

export class UsageTrackingController {
  private usageTrackingService: UsageTrackingService;

  constructor() {
    this.usageTrackingService = new UsageTrackingService();
  }

  async getUsageSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = req.params.tenantId || req.user?.tenantId;
      if (!tenantId) {
        throw new AppError('Tenant ID is required', 400);
      }

      // If requesting for a different tenant, must be superadmin
      if (req.params.tenantId && req.params.tenantId !== req.user?.tenantId && req.user?.role !== 'superadmin') {
        throw new AppError('Not authorized to view this usage data', 403);
      }

      const usageSummary = await this.usageTrackingService.getUsageSummary(tenantId);

      res.status(200).json({
        status: 'success',
        data: {
          usage: usageSummary
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async checkFeatureAccess(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = req.user?.tenantId;
      if (!tenantId) {
        throw new AppError('Tenant ID is required', 400);
      }

      const { feature } = req.params;
      if (!feature) {
        throw new AppError('Feature name is required', 400);
      }

      const hasAccess = await this.usageTrackingService.checkFeatureAccess(tenantId, feature);

      res.status(200).json({
        status: 'success',
        data: {
          feature,
          hasAccess
        }
      });
    } catch (error) {
      next(error);
    }
  }
}
