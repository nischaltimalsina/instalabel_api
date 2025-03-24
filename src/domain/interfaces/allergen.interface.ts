import { Document, ObjectId } from "mongoose";

export interface IAllergen extends Document {
  _id: ObjectId;
  name: string;
  description?: string;
  icon?: string; // Path or URL to allergen icon
  severity?: 'low' | 'medium' | 'high';
  isSystemLevel: boolean; // True for superadmin-created allergens
  createdBy: string;
  tenantId?: string; // Null for system-level allergens
  createdAt?: Date;
  updatedAt?: Date;
}
