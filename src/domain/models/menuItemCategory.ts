import mongoose, { Schema } from 'mongoose';
import { IMenuItemCategory } from '../interfaces/menuItemCategory.interface';

export type MenuItemCategoryDocument = IMenuItemCategory;

const MenuItemCategorySchema: Schema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: [true, 'Tenant ID is required'],
      index: true
    },
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
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
MenuItemCategorySchema.index({ tenantId: 1, name: 1 }, { unique: true });

export const MenuItemCategory = mongoose.model<MenuItemCategoryDocument>('MenuItemCategory', MenuItemCategorySchema); 