import mongoose, { Schema } from 'mongoose';
import { IRecipe } from '../interfaces/recipe.interface';

export type RecipeDocument = IRecipe;

const RecipeIngredientSchema = new Schema({
  ingredientId: {
    type: Schema.Types.ObjectId,
    ref: 'Ingredient',
    required: [true, 'Ingredient ID is required']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative']
  },
  unit: {
    type: String,
    required: [true, 'Unit is required']
  },
  preparationNotes: String
}, { _id: true });

const RecipeSchema: Schema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: [true, 'Tenant ID is required'],
      index: true
    },
    name: {
      type: String,
      required: [true, 'Recipe name is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    menuItemCategoryId: {
      type: Schema.Types.ObjectId,
      ref: 'MenuItemCategory',
      required: [true, 'Menu Item Category ID is required'],
      index: true
    },
    version: {
      type: Number,
      default: 1
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'archived'],
      default: 'draft'
    },
    ingredients: [RecipeIngredientSchema],
    allergens: {
      type: [String],
      default: []
    },
    preparationInstructions: String,
    cookingInstructions: String,
    servingSize: Number,
    servingUnit: String,
    yield: Number,
    yieldUnit: String,
    costPerServing: Number,
    sellPrice: Number,
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Created by is required']
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Indexes for performance
RecipeSchema.index({ tenantId: 1, name: 1 });
RecipeSchema.index({ tenantId: 1, menuItemCategoryId: 1 });
RecipeSchema.index({ tenantId: 1, status: 1 });
RecipeSchema.index({ tenantId: 1, 'allergens': 1 });

export const Recipe = mongoose.model<RecipeDocument>('Recipe', RecipeSchema);
