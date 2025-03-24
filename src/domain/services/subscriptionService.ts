import { EmailService } from './../../infrastructure/email/emailService';
import { ISubscription, SubscriptionPlan, SubscriptionStatus } from '../interfaces/subscription.interface';
import { SubscriptionRepository } from '../../infrastructure/repositories/subscriptionRepository';
import { SubscriptionDocument } from '../models/subscription';
import { AppError } from '../../api/middlewares/errorHandler';
import { PaymentService } from '../../infrastructure/payment/paymentService';
import { TenantService } from './tenantService';

export class SubscriptionService {
  private subscriptionRepository: SubscriptionRepository;
  private paymentService: PaymentService;
  private tenantService: TenantService;
  private emailService: EmailService;

  constructor() {
    this.subscriptionRepository = new SubscriptionRepository();
    this.paymentService = new PaymentService();
    this.tenantService = new TenantService();
    this.emailService = new EmailService();
  }

  async createSubscription(
    tenantId: string,
    plan: SubscriptionPlan,
    paymentMethodId?: string
  ): Promise<SubscriptionDocument> {
    // Check if tenant already has a subscription
    const existingSubscription = await this.subscriptionRepository.findByTenantId(tenantId);
    if (existingSubscription) {
      throw new AppError('Tenant already has a subscription', 400);
    }

    // Get tenant details for payment provider
    const tenant = await this.tenantService.getTenantById(tenantId);

    // Create customer in payment provider
    const customerId = await this.paymentService.createCustomer(
      tenantId,
      tenant.contactInfo.email,
      tenant.name
    );

    // Create subscription in payment provider
    const { subscriptionId, status } = await this.paymentService.createSubscription(
      customerId,
      plan,
      paymentMethodId
    );

    // Create subscription with features based on plan
    const features = this.getPlanFeatures(plan);

    // Set end date (1 month from now by default)
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    const subscriptionData: ISubscription = {
      tenantId,
      plan,
      status: status as SubscriptionStatus,
      startDate,
      endDate,
      features,
      paymentInfo: {
        provider: 'stripe',
        customerId,
        subscriptionId,
        lastPaymentDate: new Date(),
        nextPaymentDate: endDate
      }
    } as ISubscription;

    const subscription = await this.subscriptionRepository.create(subscriptionData);

    // Send confirmation email
    await this.emailService.sendSubscriptionCreatedEmail(
      tenant.contactInfo.email,
      tenant.name,
      plan
    );

    return subscription;
  }

  async getSubscription(tenantId: string): Promise<SubscriptionDocument> {
    const subscription = await this.subscriptionRepository.findByTenantId(tenantId);
    if (!subscription) {
      throw new AppError('No subscription found for this tenant', 404);
    }
    return subscription;
  }

  async updateSubscriptionPlan(tenantId: string, plan: SubscriptionPlan): Promise<SubscriptionDocument> {
    // Get existing subscription
    const subscription = await this.getSubscription(tenantId);

    // Update subscription in payment provider
    if (subscription.paymentInfo?.subscriptionId) {
      await this.paymentService.updateSubscription(
        subscription.paymentInfo.subscriptionId,
        plan
      );
    }

    // Update features based on new plan
    const features = this.getPlanFeatures(plan);

    const updatedSubscription = await this.subscriptionRepository.updateSubscription(tenantId, {
      plan,
      features
    });

    if (!updatedSubscription) {
      throw new AppError('Failed to update subscription', 400);
    }

    // Get tenant details for email
    const tenant = await this.tenantService.getTenantById(tenantId);

    // Send plan change email
    await this.emailService.sendSubscriptionUpdatedEmail(
      tenant.contactInfo.email,
      tenant.name,
      plan
    );

    return updatedSubscription;
  }

  async cancelSubscription(tenantId: string): Promise<SubscriptionDocument> {
    // Get existing subscription
    const subscription = await this.getSubscription(tenantId);

    // Cancel subscription in payment provider
    if (subscription.paymentInfo?.subscriptionId) {
      await this.paymentService.cancelSubscription(
        subscription.paymentInfo.subscriptionId
      );
    }

    const canceledSubscription = await this.subscriptionRepository.cancelSubscription(tenantId);
    if (!canceledSubscription) {
      throw new AppError('No subscription found for this tenant', 404);
    }

    // Get tenant details for email
    const tenant = await this.tenantService.getTenantById(tenantId);

    // Send cancellation email
    await this.emailService.sendSubscriptionCanceledEmail(
      tenant.contactInfo.email,
      tenant.name
    );

    return canceledSubscription;
  }

  async checkSubscriptionLimits(tenantId: string, feature: keyof ISubscription['features'], currentCount: number): Promise<boolean> {
    const subscription = await this.getSubscription(tenantId);

    // Check if subscription is active
    if (subscription.status !== 'active' && subscription.status !== 'trialing') {
      throw new AppError('Subscription is not active', 403);
    }

    // Check if the feature is a boolean flag
    if (typeof subscription.features[feature] === 'boolean') {
      return subscription.features[feature] as boolean;
    }

    // Check if the feature is a numeric limit
    const limit = subscription.features[feature] as number;
    return currentCount < limit;
  }

  // Helper to get features based on plan
  private getPlanFeatures(plan: SubscriptionPlan): ISubscription['features'] {
    switch (plan) {
      case 'basic':
        return {
          maxUsers: 3,
          maxLocations: 1,
          maxRecipes: 100,
          maxLabelsPerMonth: 1000,
          whiteLabeling: false,
          inventoryManagement: false,
          advancedReporting: false,
          apiAccess: false
        };

      case 'professional':
        return {
          maxUsers: 10,
          maxLocations: 3,
          maxRecipes: 500,
          maxLabelsPerMonth: 5000,
          whiteLabeling: false,
          inventoryManagement: true,
          advancedReporting: true,
          apiAccess: false
        };

      case 'enterprise':
        return {
          maxUsers: 100,
          maxLocations: 100,
          maxRecipes: 10000,
          maxLabelsPerMonth: 100000,
          whiteLabeling: true,
          inventoryManagement: true,
          advancedReporting: true,
          apiAccess: true
        };

      case 'custom':
        return {
          maxUsers: 999,
          maxLocations: 999,
          maxRecipes: 999999,
          maxLabelsPerMonth: 999999,
          whiteLabeling: true,
          inventoryManagement: true,
          advancedReporting: true,
          apiAccess: true
        };
    }
  }
}
