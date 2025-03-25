import { Document, ObjectId } from "mongoose";

export type LabelType = 'menuItem' | 'ingredient' | 'allergen' | 'expiry' | 'custom';

export interface ILabel extends Document {
  _id: ObjectId;
  tenantId: string;
  locationId?: string;
  recipeId?: string;
  inventoryItemId?: string;
  labelType: LabelType;
  name: string;
  content: {
    recipeName?: string;
    preparedBy?: string;
    prepDate?: Date;
    useByDate?: Date;
    expiryDate?: Date;
    allergens?: string[];
    ingredients?: string;
    storageInstructions?: string;
    additionalInfo?: string;
    qrCodeData?: string;
  };
  printedBy?: string;
  printedDate?: Date;
  isActive: boolean;
  createdBy: string;
  createdAt?: Date;
  updatedAt?: Date;
}
