import { Document, ObjectId } from "mongoose";

export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'trialing';
export type SubscriptionPlan = 'basic' | 'professional' | 'enterprise' | 'custom';

export interface ISubscription extends Document {
  _id: ObjectId;
  tenantId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  startDate: Date;
  endDate: Date;
  trialEndsAt?: Date;
  canceledAt?: Date;
  features: {
    maxUsers: number;
    maxLocations: number;
    maxRecipes: number;
    maxLabelsPerMonth: number;
    whiteLabeling: boolean;
    inventoryManagement: boolean;
    advancedReporting: boolean;
    apiAccess: boolean;
    // Other feature flags
  };
  paymentInfo?: {
    provider?: string;
    customerId?: string;
    subscriptionId?: string;
    lastPaymentDate?: Date;
    nextPaymentDate?: Date;
  };
  createdAt?: Date;
  updatedAt?: Date;
}
