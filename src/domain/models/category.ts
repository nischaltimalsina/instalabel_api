import mongoose, { Schema } from 'mongoose';
import { ICategory } from '../interfaces/category.interface';

export type CategoryDocument = ICategory;

const CategorySchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: false // Optional - if null, it's a system-wide category
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

// Create compound index to ensure unique names per tenant or for system-wide categories
CategorySchema.index({ name: 1, tenantId: 1 }, { unique: true });

export const Category = mongoose.model<CategoryDocument>('Category', CategorySchema); 