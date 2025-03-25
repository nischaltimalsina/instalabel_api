import { Document, ObjectId } from "mongoose";

export interface IAllergen extends Document {
  _id: ObjectId;
  name: string;
  description?: string;
  icon?: string; // Path or URL to allergen icon
  isSystemLevel: boolean; // True for superadmin-created allergens
  relatedIngredients?: string[]; // Common ingredients that contain this allergen
  createdBy: string;
  createdAt?: Date;
  updatedAt?: Date;
}
