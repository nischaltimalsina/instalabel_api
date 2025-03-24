import mongoose, { Schema, Document } from 'mongoose';
import { ITenant } from '../interfaces/tenant.interface';

export interface TenantDocument extends ITenant {}

const TenantSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Tenant name is required'],
      trim: true,
      maxlength: [100, 'Tenant name cannot be more than 100 characters']
    },
    subscriptionPlan: {
      type: String,
      enum: ['basic', 'professional', 'enterprise'],
      default: 'basic'
    },
    contactInfo: {
      email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true
      },
      phone: {
        type: String,
        trim: true
      },
      address: {
        street: String,
        city: String,
        state: String,
        postalCode: String,
        country: String
      }
    },
    billingInfo: {
      paymentMethod: {
        type: Object
      },
      billingAddress: {
        type: Object
      }
    },
    whiteLabelSettings: {
      logoUrl: String,
      colors: {
        primary: String,
        secondary: String,
        accent: String
      },
      customDomain: String
    },
    active: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Index for performance improvement on common queries
TenantSchema.index({ 'contactInfo.email': 1 });
TenantSchema.index({ name: 1 });
TenantSchema.index({ subscriptionPlan: 1 });

export const Tenant = mongoose.model<TenantDocument>('Tenant', TenantSchema);
