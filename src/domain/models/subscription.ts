import mongoose, { Schema } from 'mongoose';
import { ISubscription, SubscriptionPlan, SubscriptionStatus } from '../interfaces/subscription.interface';

export type SubscriptionDocument = ISubscription;

const SubscriptionSchema: Schema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: [true, 'Tenant ID is required'],
      unique: true,
      index: true
    },
    plan: {
      type: String,
      enum: ['basic', 'professional', 'enterprise', 'custom'],
      required: [true, 'Subscription plan is required'],
      default: 'basic'
    },
    status: {
      type: String,
      enum: ['active', 'past_due', 'canceled', 'trialing'],
      required: [true, 'Status is required'],
      default: 'active'
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
      default: Date.now
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required']
    },
    trialEndsAt: Date,
    canceledAt: Date,
    features: {
      maxUsers: {
        type: Number,
        required: true,
        default: 3 // Basic plan default
      },
      maxLocations: {
        type: Number,
        required: true,
        default: 1 // Basic plan default
      },
      maxRecipes: {
        type: Number,
        required: true,
        default: 100 // Basic plan default
      },
      maxLabelsPerMonth: {
        type: Number,
        required: true,
        default: 1000 // Basic plan default
      },
      whiteLabeling: {
        type: Boolean,
        default: false
      },
      inventoryManagement: {
        type: Boolean,
        default: false
      },
      advancedReporting: {
        type: Boolean,
        default: false
      },
      apiAccess: {
        type: Boolean,
        default: false
      }
    },
    paymentInfo: {
      provider: String,
      customerId: String,
      subscriptionId: String,
      lastPaymentDate: Date,
      nextPaymentDate: Date
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

export const Subscription = mongoose.model<SubscriptionDocument>('Subscription', SubscriptionSchema);
