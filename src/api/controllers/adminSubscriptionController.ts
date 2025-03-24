import { Request, Response, NextFunction } from 'express';
import { SubscriptionRepository } from '../../infrastructure/repositories/subscriptionRepository';
import { AppError } from '../middlewares/errorHandler';
import { SubscriptionPlan } from '../../domain/interfaces/subscription.interface';

export class AdminSubscriptionController {
  private subscriptionRepository: SubscriptionRepository;

  constructor() {
    this.subscriptionRepository = new SubscriptionRepository();
  }

  async getAllSubscriptions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Only super admins can access all subscriptions
      if (req.user?.role !== 'superadmin') {
        throw new AppError('Not authorized to access all subscriptions', 403);
      }

      // Optional filtering by plan or status
      const { plan, status } = req.query;
      const filter: any = {};

      if (plan) {
        filter.plan = plan;
      }

      if (status) {
        filter.status = status;
      }

      const subscriptions = await this.subscriptionRepository.findAll(filter);

      res.status(200).json({
        status: 'success',
        results: subscriptions.length,
        data: {
          subscriptions
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getSubscriptionsByPlan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Only super admins can access
      if (req.user?.role !== 'superadmin') {
        throw new AppError('Not authorized to access subscription analytics', 403);
      }

      const { plan } = req.params;
      if (!plan || !['basic', 'professional', 'enterprise', 'custom'].includes(plan)) {
        throw new AppError('Valid subscription plan is required', 400);
      }

      const subscriptions = await this.subscriptionRepository.getByPlan(plan as SubscriptionPlan);

      res.status(200).json({
        status: 'success',
        results: subscriptions.length,
        data: {
          subscriptions
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getSubscriptionAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Only super admins can access
      if (req.user?.role !== 'superadmin') {
        throw new AppError('Not authorized to access subscription analytics', 403);
      }

      // Get all subscriptions
      const allSubscriptions = await this.subscriptionRepository.findAll({});

      // Calculate analytics
      const analytics = {
        totalSubscriptions: allSubscriptions.length,
        byPlan: {
          basic: allSubscriptions.filter(sub => sub.plan === 'basic').length,
          professional: allSubscriptions.filter(sub => sub.plan === 'professional').length,
          enterprise: allSubscriptions.filter(sub => sub.plan === 'enterprise').length,
          custom: allSubscriptions.filter(sub => sub.plan === 'custom').length
        },
        byStatus: {
          active: allSubscriptions.filter(sub => sub.status === 'active').length,
          trialing: allSubscriptions.filter(sub => sub.status === 'trialing').length,
          past_due: allSubscriptions.filter(sub => sub.status === 'past_due').length,
          canceled: allSubscriptions.filter(sub => sub.status === 'canceled').length
        },
        // Could add more analytics like MRR, churn rate, etc.
      };

      res.status(200).json({
        status: 'success',
        data: {
          analytics
        }
      });
    } catch (error) {
      next(error);
    }
  }
}
