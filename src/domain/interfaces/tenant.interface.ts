import { Document, ObjectId } from "mongoose";

export interface ITenant extends Document {
  _id: ObjectId;
  name: string;
  subscriptionPlan: string;
  contactInfo: {
    email: string;
    phone?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      country?: string;
    };
  };
  billingInfo?: {
    paymentMethod?: object;
    billingAddress?: object;
  };
  whiteLabelSettings?: {
    logoUrl?: string;
    colors?: {
      primary?: string;
      secondary?: string;
      accent?: string;
    };
    customDomain?: string;
  };
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
