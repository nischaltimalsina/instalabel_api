import { AppError } from '../../api/middlewares/errorHandler';

export class EmailService {
  private from: string = 'support@kitchenlabelsaas.com';

  // In production, this would connect to an email service provider like SendGrid, Mailgun, etc.
  async sendEmail(to: string, subject: string, content: string): Promise<void> {
    try {
      // Mock implementation - would integrate with a real email service
      console.log(`SENDING EMAIL to ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Content: ${content}`);
      console.log('----------------------');

      // In production: await emailProvider.send({ to, from: this.from, subject, content });
    } catch (error) {
      console.error('Email service error:', error);
      throw new AppError('Failed to send email', 500);
    }
  }

  async sendSubscriptionCreatedEmail(email: string, tenantName: string, planName: string): Promise<void> {
    const subject = `Your ${planName} Subscription to Kitchen Labeling SaaS is Active`;
    const content = `
      Hello ${tenantName},

      Thank you for subscribing to Kitchen Labeling SaaS! Your ${planName} plan is now active.

      Here's what's included in your plan:
      ${this.getPlanFeaturesList(planName)}

      If you have any questions, please contact our support team.

      Best regards,
      Kitchen Labeling SaaS Team
    `;

    await this.sendEmail(email, subject, content);
  }

  async sendSubscriptionUpdatedEmail(email: string, tenantName: string, planName: string): Promise<void> {
    const subject = `Your Kitchen Labeling SaaS Subscription Has Been Updated`;
    const content = `
      Hello ${tenantName},

      Your subscription has been updated to the ${planName} plan.

      Here's what's included in your new plan:
      ${this.getPlanFeaturesList(planName)}

      If you have any questions, please contact our support team.

      Best regards,
      Kitchen Labeling SaaS Team
    `;

    await this.sendEmail(email, subject, content);
  }

  async sendSubscriptionCanceledEmail(email: string, tenantName: string): Promise<void> {
    const subject = `Your Kitchen Labeling SaaS Subscription Has Been Canceled`;
    const content = `
      Hello ${tenantName},

      We're sorry to see you go. Your subscription to Kitchen Labeling SaaS has been canceled.

      Your data will be retained for 30 days after which it will be permanently deleted.
      If you change your mind, you can reactivate your subscription within this period.

      We'd love to hear your feedback about what we could have done better.

      Best regards,
      Kitchen Labeling SaaS Team
    `;

    await this.sendEmail(email, subject, content);
  }

  async sendPaymentFailedEmail(email: string, tenantName: string): Promise<void> {
    const subject = `Action Required: Payment Failed for Kitchen Labeling SaaS`;
    const content = `
      Hello ${tenantName},

      We were unable to process your latest payment for Kitchen Labeling SaaS subscription.

      Please update your payment information in your account settings to avoid service interruption.
      If you need assistance, please contact our support team.

      Best regards,
      Kitchen Labeling SaaS Team
    `;

    await this.sendEmail(email, subject, content);
  }

  async sendPaymentSuccessEmail(email: string, tenantName: string, planName: string, amount: number): Promise<void> {
    const subject = `Payment Successful for Kitchen Labeling SaaS`;
    const content = `
      Hello ${tenantName},

      We've processed your payment of $${amount.toFixed(2)} for the ${planName} plan.
      Your subscription is active until the next billing cycle.

      If you have any questions, please contact our support team.

      Best regards,
      Kitchen Labeling SaaS Team
    `;

    await this.sendEmail(email, subject, content);
  }

  private getPlanFeaturesList(planName: string): string {
    switch (planName) {
      case 'basic':
        return `
          - 3 Users
          - 1 Location
          - 100 Recipes
          - 1,000 Labels per month
          - Basic support
        `;
      case 'professional':
        return `
          - 10 Users
          - 3 Locations
          - 500 Recipes
          - 5,000 Labels per month
          - Inventory management
          - Advanced reporting
          - Priority support
        `;
      case 'enterprise':
        return `
          - 100 Users
          - Unlimited Locations
          - 10,000 Recipes
          - 100,000 Labels per month
          - White-labeling
          - Inventory management
          - Advanced reporting
          - API access
          - Dedicated support
        `;
      default:
        return 'Custom plan features';
    }
  }
}
