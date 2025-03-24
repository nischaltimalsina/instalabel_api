import mongoose, { Schema } from 'mongoose';
import { IInventoryItem } from '../interfaces/inventoryItem.interface';

export type InventoryItemDocument = IInventoryItem;

const InventoryItemSchema: Schema = new Schema(
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
    ingredientId: {
      type: Schema.Types.ObjectId,
      ref: 'Ingredient',
      required: [true, 'Ingredient ID is required'],
      index: true
    },
    batchNumber: {
      type: String,
      trim: true
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
    deliveryDate: {
      type: Date,
      required: [true, 'Delivery date is required'],
      default: Date.now
    },
    expiryDate: {
      type: Date,
      required: [true, 'Expiry date is required']
    },
    storageLocation: {
      type: String,
      trim: true
    },
    supplier: {
      type: String,
      trim: true
    },
    cost: {
      type: Number,
      min: [0, 'Cost cannot be negative']
    },
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
InventoryItemSchema.index({ tenantId: 1, ingredientId: 1 });
InventoryItemSchema.index({ tenantId: 1, expiryDate: 1 });
InventoryItemSchema.index({ tenantId: 1, locationId: 1, expiryDate: 1 });

export const InventoryItem = mongoose.model<InventoryItemDocument>('InventoryItem', InventoryItemSchema);
