import { Subscription, SubscriptionDocument } from '../../domain/models/subscription';
import { ISubscription, SubscriptionPlan } from '../../domain/interfaces/subscription.interface';
import { AppError } from '../../api/middlewares/errorHandler';

export class SubscriptionRepository {
  async create(subscriptionData: ISubscription): Promise<SubscriptionDocument> {
    try {
      return await Subscription.create(subscriptionData);
    } catch (error: unknown) {
      if (error instanceof Error && (error as any).code === 11000) {
        throw new AppError('Tenant already has a subscription', 400);
      }
      throw error;
    }
  }

  async findByTenantId(tenantId: string): Promise<SubscriptionDocument | null> {
    return Subscription.findOne({ tenantId });
  }

  async updateSubscription(tenantId: string, subscriptionData: Partial<ISubscription>): Promise<SubscriptionDocument | null> {
    return Subscription.findOneAndUpdate(
      { tenantId },
      subscriptionData,
      { new: true, runValidators: true }
    );
  }

  async cancelSubscription(tenantId: string): Promise<SubscriptionDocument | null> {
    return Subscription.findOneAndUpdate(
      { tenantId },
      {
        status: 'canceled',
        canceledAt: new Date()
      },
      { new: true }
    );
  }

  async findBySubscriptionId(subscriptionId: string): Promise<SubscriptionDocument | null> {
  return Subscription.findOne({ 'paymentInfo.subscriptionId': subscriptionId });
}

async findAll(filter: any = {}): Promise<SubscriptionDocument[]> {
  return Subscription.find(filter);
}

  async getByPlan(plan: SubscriptionPlan): Promise<SubscriptionDocument[]> {
    return Subscription.find({ plan });
  }
}
