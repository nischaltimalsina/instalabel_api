import { InventoryItem, InventoryItemDocument } from '../../domain/models/inventoryItem';
import { IInventoryItem } from '../../domain/interfaces/inventoryItem.interface';
import { AppError } from '../../api/middlewares/errorHandler';

export class InventoryItemRepository {
  async create(inventoryItemData: IInventoryItem): Promise<InventoryItemDocument> {
    try {
      return await InventoryItem.create(inventoryItemData);
    } catch (error: unknown) {
      throw error;
    }
  }

  async findById(id: string, tenantId: string): Promise<InventoryItemDocument | null> {
    return InventoryItem.findOne({ _id: id, tenantId, isActive: true })
      .populate('ingredientId', 'name allergens defaultUnit')
      .populate('createdBy', 'firstName lastName');
  }

  async findByTenant(tenantId: string, query: any = {}): Promise<InventoryItemDocument[]> {
    const filter = { tenantId, isActive: true, ...query };
    return InventoryItem.find(filter)
      .populate('ingredientId', 'name allergens defaultUnit')
      .populate('createdBy', 'firstName lastName')
      .sort({ expiryDate: 1 });
  }

  async findByIngredient(tenantId: string, ingredientId: string): Promise<InventoryItemDocument[]> {
    return InventoryItem.find({ tenantId, ingredientId, isActive: true })
      .populate('ingredientId', 'name allergens defaultUnit')
      .populate('createdBy', 'firstName lastName')
      .sort({ expiryDate: 1 });
  }

  async findExpiringItems(tenantId: string, days: number = 3): Promise<InventoryItemDocument[]> {
    const today = new Date();
    const expiryThreshold = new Date();
    expiryThreshold.setDate(today.getDate() + days);

    return InventoryItem.find({
      tenantId,
      isActive: true,
      expiryDate: { $gte: today, $lte: expiryThreshold }
    })
      .populate('ingredientId', 'name allergens defaultUnit')
      .populate('createdBy', 'firstName lastName')
      .sort({ expiryDate: 1 });
  }

  async findExpiredItems(tenantId: string): Promise<InventoryItemDocument[]> {
    const today = new Date();

    return InventoryItem.find({
      tenantId,
      isActive: true,
      expiryDate: { $lt: today }
    })
      .populate('ingredientId', 'name allergens defaultUnit')
      .populate('createdBy', 'firstName lastName')
      .sort({ expiryDate: 1 });
  }

  async findByLocation(tenantId: string, locationId: string): Promise<InventoryItemDocument[]> {
    return InventoryItem.find({ tenantId, locationId, isActive: true })
      .populate('ingredientId', 'name allergens defaultUnit')
      .populate('createdBy', 'firstName lastName')
      .sort({ expiryDate: 1 });
  }

  async findLowStockItems(tenantId: string, thresholds: Record<string, number>): Promise<InventoryItemDocument[]> {
    const lowStockItems: InventoryItemDocument[] = [];

    // Get all active inventory items
    const items = await InventoryItem.find({ tenantId, isActive: true })
      .populate('ingredientId', 'name allergens defaultUnit')
      .populate('createdBy', 'firstName lastName');

    // Filter items below threshold
    for (const item of items) {
      const ingredientId = item.ingredientId.toString();

      if (thresholds[ingredientId] && item.quantity < thresholds[ingredientId]) {
        lowStockItems.push(item);
      }
    }

    return lowStockItems;
  }

  async update(id: string, tenantId: string, inventoryItemData: Partial<IInventoryItem>): Promise<InventoryItemDocument | null> {
    return InventoryItem.findOneAndUpdate(
      { _id: id, tenantId, isActive: true },
      inventoryItemData,
      { new: true, runValidators: true }
    )
    .populate('ingredientId', 'name allergens defaultUnit')
    .populate('createdBy', 'firstName lastName');
  }

  async adjustQuantity(id: string, tenantId: string, adjustment: number): Promise<InventoryItemDocument | null> {
    const inventoryItem = await InventoryItem.findOne({ _id: id, tenantId, isActive: true });

    if (!inventoryItem) {
      return null;
    }

    const newQuantity = inventoryItem.quantity + adjustment;

    if (newQuantity < 0) {
      throw new AppError('Insufficient quantity for adjustment', 400);
    }

    return InventoryItem.findOneAndUpdate(
      { _id: id, tenantId, isActive: true },
      { quantity: newQuantity },
      { new: true, runValidators: true }
    )
    .populate('ingredientId', 'name allergens defaultUnit')
    .populate('createdBy', 'firstName lastName');
  }

  async delete(id: string, tenantId: string): Promise<InventoryItemDocument | null> {
    // Soft delete
    return InventoryItem.findOneAndUpdate(
      { _id: id, tenantId },
      { isActive: false },
      { new: true }
    );
  }
}
