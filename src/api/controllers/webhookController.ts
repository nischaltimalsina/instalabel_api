import { NextFunction, Request, Response } from "express";
import { SubscriptionRepository } from "../../infrastructure/repositories/subscriptionRepository";
import { AppError } from "../middlewares/errorHandler";
import { EmailService } from "../../infrastructure/email/emailService";
import { TenantService } from "../../domain/services/tenantService";

export class WebhookController {
  private subscriptionRepository: SubscriptionRepository;
  private emailService: EmailService;
  private tenantService: TenantService;

  constructor() {
    this.subscriptionRepository = new SubscriptionRepository();
    this.emailService = new EmailService();
    this.tenantService = new TenantService();
  }

  async handleStripeWebhook(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      // In production, you'd verify the webhook signature
      const event = req.body;

      // Process different event types
      switch (event.type) {
        case "customer.subscription.created":
          await this.handleSubscriptionCreated(event.data.object);
          break;

        case "customer.subscription.updated":
          await this.handleSubscriptionUpdated(event.data.object);
          break;

        case "customer.subscription.deleted":
          await this.handleSubscriptionDeleted(event.data.object);
          break;

        case "invoice.payment_succeeded":
          await this.handlePaymentSucceeded(event.data.object);
          break;

        case "invoice.payment_failed":
          await this.handlePaymentFailed(event.data.object);
          break;
      }

      // Acknowledge receipt of the event
      res.status(200).json({ received: true });
    } catch (error) {
      next(error);
    }
  }

  private async handleSubscriptionCreated(subscription: any): Promise<void> {
    // This is mostly handled by our createSubscription method
    console.log("Subscription created:", subscription.id);
  }

  private async handleSubscriptionUpdated(subscription: any): Promise<void> {
    // Find the tenant by subscription ID
    const existingSubscription = await this.subscriptionRepository
      .findBySubscriptionId(
        subscription.id,
      );

    if (!existingSubscription) {
      console.error("Subscription not found:", subscription.id);
      return;
    }

    // Update status if changed
    if (existingSubscription.status !== subscription.status) {
      await this.subscriptionRepository.updateSubscription(
        existingSubscription.tenantId.toString(),
        { status: subscription.status },
      );
    }

    // Update next payment date if available
    if (subscription.current_period_end) {
      const nextPaymentDate = new Date(subscription.current_period_end * 1000);
      await this.subscriptionRepository.updateSubscription(
        existingSubscription.tenantId.toString(),
        {
          endDate: nextPaymentDate,
          paymentInfo: {
            ...existingSubscription.paymentInfo,
            lastPaymentDate: nextPaymentDate,
          },
        },
      );
    }

    console.log("Subscription updated:", subscription.id);
  }

  private async handleSubscriptionDeleted(subscription: any): Promise<void> {
    // Find the tenant by subscription ID
    const existingSubscription = await this.subscriptionRepository
      .findBySubscriptionId(
        subscription.id,
      );

    if (!existingSubscription) {
      console.error("Subscription not found:", subscription.id);
      return;
    }

    // Update subscription status to canceled
    await this.subscriptionRepository.updateSubscription(
      existingSubscription.tenantId.toString(),
      {
        status: "canceled",
        canceledAt: new Date(),
      },
    );

    console.log("Subscription deleted:", subscription.id);
  }

  private async handlePaymentSucceeded(invoice: any): Promise<void> {
    // Find the tenant by subscription ID
    const existingSubscription = await this.subscriptionRepository.findBySubscriptionId(
      invoice.subscription
    );

    if (!existingSubscription) {
      console.error('Subscription not found:', invoice.subscription);
      return;
    }

    // Update last payment date
    const paymentDate = new Date(invoice.created * 1000);
    await this.subscriptionRepository.updateSubscription(
      existingSubscription.tenantId.toString(),
      {
        paymentInfo: {
          ...existingSubscription.paymentInfo,
          lastPaymentDate: paymentDate,
        },
      }
    );

    // Get tenant details for email
    const tenant = await this.tenantService.getTenantById(
      existingSubscription.tenantId.toString()
    );

    // Send payment success email
    await this.emailService.sendPaymentSuccessEmail(
      tenant.contactInfo.email,
      tenant.name,
      existingSubscription.plan,
      invoice.amount_paid / 100 // Stripe amounts are in cents
    );

    console.log('Payment succeeded for subscription:', invoice.subscription);
  }

  private async handlePaymentFailed(invoice: any): Promise<void> {
    // Find the tenant by subscription ID
    const existingSubscription = await this.subscriptionRepository
      .findBySubscriptionId(
        invoice.subscription,
      );

    if (!existingSubscription) {
      console.error("Subscription not found:", invoice.subscription);
      return;
    }

    // Update subscription status to past_due
    await this.subscriptionRepository.updateSubscription(
      existingSubscription.tenantId.toString(),
      { status: "past_due" },
    );

    const tenant = await this.tenantService.getTenantById(
      existingSubscription.tenantId.toString()
    );

    // Send payment failed email
    await this.emailService.sendPaymentFailedEmail(
      tenant.contactInfo.email,
      tenant.name
    );

    console.log('Payment failed for subscription:', invoice.subscription);
  }
}
