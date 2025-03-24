import mongoose, { Schema } from 'mongoose';
import { IIngredient } from '../interfaces/ingredient.interface';

export type IngredientDocument = IIngredient;

const IngredientSchema: Schema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: [true, 'Tenant ID is required'],
      index: true
    },
    name: {
      type: String,
      required: [true, 'Ingredient name is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    allergens: {
      type: [String],
      default: []
    },
    nutritionalInfo: {
      calories: Number,
      protein: Number,
      fat: Number,
      carbs: Number
    },
    supplierInfo: {
      supplierId: String,
      supplierName: String,
      sku: String
    },
    defaultUnit: {
      type: String,
      required: [true, 'Default unit is required'],
      default: 'g' // grams as default
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Indexes for performance
IngredientSchema.index({ tenantId: 1, name: 1 }, { unique: true });
IngredientSchema.index({ tenantId: 1, 'allergens': 1 });

export const Ingredient = mongoose.model<IngredientDocument>('Ingredient', IngredientSchema);
