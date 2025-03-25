import { Document, ObjectId } from "mongoose";

export interface IRecipeIngredient {
  ingredientId: string;
  quantity: number;
  unit: string;
  preparationNotes?: string;
}

export interface IRecipe extends Document {
  _id: ObjectId;
  tenantId: string;
  name: string;
  description?: string;
  menuItemCategoryId: string;  // Reference to MenuItemCategory
  version: number;
  status: 'draft' | 'active' | 'archived';
  ingredients: IRecipeIngredient[];
  allergens: string[];
  preparationInstructions?: string;
  cookingInstructions?: string;
  servingSize?: number;
  servingUnit?: string;
  yield?: number;
  yieldUnit?: string;
  costPerServing?: number;
  sellPrice?: number;
  isActive: boolean;
  createdBy: string;
  updatedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
