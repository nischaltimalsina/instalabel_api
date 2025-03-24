import { Document, ObjectId } from "mongoose";

export interface IInventoryItem extends Document {
  _id: ObjectId;
  tenantId: string;
  locationId?: string;
  ingredientId: string;
  batchNumber?: string;
  quantity: number;
  unit: string;
  deliveryDate: Date;
  expiryDate: Date;
  storageLocation?: string;
  supplier?: string;
  cost?: number;
  isActive: boolean;
  createdBy: string;
  createdAt?: Date;
  updatedAt?: Date;
}
