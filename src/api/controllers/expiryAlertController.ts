import { Request, Response, NextFunction } from 'express';
import { ExpiryAlertService, AlertLevel } from '../../domain/services/expiryAlertService';
import { AppError } from '../middlewares/errorHandler';

export class ExpiryAlertController {
  private expiryAlertService: ExpiryAlertService;

  constructor() {
    this.expiryAlertService = new ExpiryAlertService();
  }

  async getExpiryAlerts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = req.user?.tenantId;
      if (!tenantId) {
        throw new AppError('Tenant ID is required', 400);
      }

      const days = req.query.days ? parseInt(req.query.days as string) : 3;

      const alertItems = await this.expiryAlertService.generateExpiryAlerts(tenantId, days);

      res.status(200).json({
        status: 'success',
        results: alertItems.length,
        data: {
          alerts: alertItems
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getExpiredAlerts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = req.user?.tenantId;
      if (!tenantId) {
        throw new AppError('Tenant ID is required', 400);
      }

      const alertItems = await this.expiryAlertService.generateExpiredAlerts(tenantId);

      res.status(200).json({
        status: 'success',
        results: alertItems.length,
        data: {
          alerts: alertItems
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getExpiryAlertReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = req.user?.tenantId;
      if (!tenantId) {
        throw new AppError('Tenant ID is required', 400);
      }

      // Parse query parameters
      const locationId = req.query.locationId as string | undefined;
      const includeExpired = req.query.includeExpired === 'true';
      const daysThreshold = req.query.days ? parseInt(req.query.days as string) : 3;

      // Parse alert levels if provided
      let alertLevel: AlertLevel[] | undefined;
      if (req.query.alertLevel) {
        const alertLevelParam = req.query.alertLevel as string;
        const levels = alertLevelParam.split(',');

        // Validate each level
        const validLevels = ['low', 'medium', 'high', 'critical'];
        alertLevel = levels.filter(level => validLevels.includes(level)) as AlertLevel[];

        if (alertLevel.length === 0) {
          alertLevel = undefined;
        }
      }

      const report = await this.expiryAlertService.generateExpiryAlertReport(tenantId, {
        locationId,
        includeExpired,
        daysThreshold,
        alertLevel
      });

      res.status(200).json({
        status: 'success',
        data: {
          report
        }
      });
    } catch (error) {
      next(error);
    }
  }
}
