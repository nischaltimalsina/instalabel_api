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
    isSystemLevel: {
      type: Boolean,
      default: false
    },
    relatedIngredients: {
      type: [String],
      default: []
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Index for searches
AllergenSchema.index({ name: 1 });

export const Allergen = mongoose.model<IAllergen>('Allergen', AllergenSchema);
