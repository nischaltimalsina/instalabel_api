import { Document, ObjectId } from "mongoose";

export interface IMenuItemCategory extends Document {
  _id: ObjectId;
  tenantId: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdBy: string;
  updatedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
} 