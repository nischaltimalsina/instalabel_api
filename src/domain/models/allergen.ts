import mongoose, { Schema } from 'mongoose';
import { IAllergen } from '../interfaces/allergen.interface';

const AllergenSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Allergen name is required'],
      trim: true,
      unique: true
    },
    description: {
      type: String,
      trim: true
    },
    icon: {
      type: String
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    isSystemLevel: {
      type: Boolean,
      default: false
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant'
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Compound index for searches
AllergenSchema.index({ name: 1, isSystemLevel: 1 });
AllergenSchema.index({ tenantId: 1 }, { sparse: true });

export const Allergen = mongoose.model<IAllergen>('Allergen', AllergenSchema);
