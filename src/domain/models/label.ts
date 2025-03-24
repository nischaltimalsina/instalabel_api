import mongoose, { Schema } from 'mongoose';
import { ILabel, LabelType } from '../interfaces/label.interface';

export type LabelDocument = ILabel;

const LabelSchema: Schema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: [true, 'Tenant ID is required'],
      index: true
    },
    locationId: {
      type: Schema.Types.ObjectId,
      ref: 'Location'
    },
    recipeId: {
      type: Schema.Types.ObjectId,
      ref: 'Recipe'
    },
    inventoryItemId: {
      type: Schema.Types.ObjectId,
      ref: 'InventoryItem'
    },
    labelType: {
      type: String,
      enum: ['prep', 'allergen', 'expiry', 'custom'],
      required: [true, 'Label type is required']
    },
    name: {
      type: String,
      required: [true, 'Label name is required'],
      trim: true
    },
    content: {
      recipeName: String,
      preparedBy: String,
      prepDate: Date,
      useByDate: Date,
      expiryDate: Date,
      allergens: [String],
      ingredients: String,
      storageInstructions: String,
      additionalInfo: String,
      qrCodeData: String
    },
    printedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    printedDate: Date,
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Created by is required']
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Indexes for performance
LabelSchema.index({ tenantId: 1, labelType: 1 });
LabelSchema.index({ tenantId: 1, recipeId: 1 });
LabelSchema.index({ tenantId: 1, inventoryItemId: 1 });
LabelSchema.index({ tenantId: 1, createdAt: -1 });

export const Label = mongoose.model<LabelDocument>('Label', LabelSchema);
