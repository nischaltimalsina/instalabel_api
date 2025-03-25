import { Document, ObjectId } from "mongoose";

export interface ICategory extends Document {
  _id: ObjectId;
  name: string;
  description?: string;
  tenantId?: string; // Optional - if null, it's a system-wide category
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
} 