import { Document, ObjectId } from "mongoose";

export interface IIngredient extends Document {
  _id: ObjectId;
  tenantId: string;
  name: string;
  description?: string;
  allergens: string[];
  nutritionalInfo?: {
    calories?: number;
    protein?: number;
    fat?: number;
    carbs?: number;
    [key: string]: number | undefined;
  };
  supplierInfo?: {
    supplierId?: string;
    supplierName?: string;
    sku?: string;
  };
  defaultUnit: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
