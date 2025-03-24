import { Request, Response, NextFunction } from 'express';
import { SubscriptionService } from '../../domain/services/subscriptionService';
import { AppError } from '../middlewares/errorHandler';
import { SubscriptionPlan } from '../../domain/interfaces/subscription.interface';

export class SubscriptionController {
  private subscriptionService: SubscriptionService;

  constructor() {
    this.subscriptionService = new SubscriptionService();
  }

  async createSubscription(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = req.params.tenantId || req.user?.tenantId;
      if (!tenantId) {
        throw new AppError('Tenant ID is required', 400);
      }

      // Ensure the user has permission (admin only)
      if (req.user?.role !== 'admin' && req.user?.role !== 'superadmin') {
        throw new AppError('Only admins can manage subscriptions', 403);
      }

      const { plan } = req.body;
      if (!plan || !['basic', 'professional', 'enterprise', 'custom'].includes(plan)) {
        throw new AppError('Valid subscription plan is required', 400);
      }

      const subscription = await this.subscriptionService.createSubscription(
        tenantId,
        plan as SubscriptionPlan
      );

      res.status(201).json({
        status: 'success',
        data: {
          subscription
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getSubscription(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = req.params.tenantId || req.user?.tenantId;
      if (!tenantId) {
        throw new AppError('Tenant ID is required', 400);
      }

      // If requesting for a different tenant, must be superadmin
      if (req.params.tenantId && req.params.tenantId !== req.user?.tenantId && req.user?.role !== 'superadmin') {
        throw new AppError('Not authorized to view this subscription', 403);
      }

      const subscription = await this.subscriptionService.getSubscription(tenantId);

      res.status(200).json({
        status: 'success',
        data: {
          subscription
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async updateSubscription(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = req.params.tenantId || req.user?.tenantId;
      if (!tenantId) {
        throw new AppError('Tenant ID is required', 400);
      }

      // Ensure the user has permission (admin only)
      if (req.user?.role !== 'admin' && req.user?.role !== 'superadmin') {
        throw new AppError('Only admins can manage subscriptions', 403);
      }

      // If updating for a different tenant, must be superadmin
      if (req.params.tenantId && req.params.tenantId !== req.user?.tenantId && req.user?.role !== 'superadmin') {
        throw new AppError('Not authorized to update this subscription', 403);
      }

      const { plan } = req.body;
      if (!plan || !['basic', 'professional', 'enterprise', 'custom'].includes(plan)) {
        throw new AppError('Valid subscription plan is required', 400);
      }

      const subscription = await this.subscriptionService.updateSubscriptionPlan(
        tenantId,
        plan as SubscriptionPlan
      );

      res.status(200).json({
        status: 'success',
        data: {
          subscription
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async cancelSubscription(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = req.params.tenantId || req.user?.tenantId;
      if (!tenantId) {
        throw new AppError('Tenant ID is required', 400);
      }

      // Ensure the user has permission (admin only)
      if (req.user?.role !== 'admin' && req.user?.role !== 'superadmin') {
        throw new AppError('Only admins can manage subscriptions', 403);
      }

      // If canceling for a different tenant, must be superadmin
      if (req.params.tenantId && req.params.tenantId !== req.user?.tenantId && req.user?.role !== 'superadmin') {
        throw new AppError('Not authorized to cancel this subscription', 403);
      }

      const subscription = await this.subscriptionService.cancelSubscription(tenantId);

      res.status(200).json({
        status: 'success',
        data: {
          subscription
        }
      });
    } catch (error) {
      next(error);
    }
  }
}
