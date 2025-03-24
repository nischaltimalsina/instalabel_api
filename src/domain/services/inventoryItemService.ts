import { IInventoryItem } from '../interfaces/inventoryItem.interface';
import { InventoryItemRepository } from '../../infrastructure/repositories/inventoryItemRepository';
import { IngredientService } from './ingredientService';
import { InventoryItemDocument } from '../models/inventoryItem';
import { IngredientDocument } from '../models/ingredient';
import { AppError } from '../../api/middlewares/errorHandler';
import { convertUnits } from '../../utils/unitConversion';

export class InventoryItemService {
  private inventoryItemRepository: InventoryItemRepository;
  private ingredientService: IngredientService;

  constructor() {
    this.inventoryItemRepository = new InventoryItemRepository();
    this.ingredientService = new IngredientService();
  }

  async createInventoryItem(tenantId: string, userId: string, inventoryItemData: Partial<IInventoryItem>): Promise<InventoryItemDocument> {
    // Validate inventory item data
    this.validateInventoryItemData(inventoryItemData);

    // Check if the ingredient exists
    const ingredient = await this.ingredientService.getIngredientById(tenantId, inventoryItemData.ingredientId as string);

    // Create the inventory item with tenant ID
    const inventoryItem = {
      ...inventoryItemData,
      tenantId,
      createdBy: userId,
      isActive: true
    } as IInventoryItem;

    return this.inventoryItemRepository.create(inventoryItem);
  }

  async getInventoryItemById(tenantId: string, id: string): Promise<InventoryItemDocument> {
    const inventoryItem = await this.inventoryItemRepository.findById(id, tenantId);
    if (!inventoryItem) {
      throw new AppError('Inventory item not found', 404);
    }
    return inventoryItem;
  }

  async getInventoryItemsByTenant(tenantId: string, filters: any = {}): Promise<InventoryItemDocument[]> {
    return this.inventoryItemRepository.findByTenant(tenantId, filters);
  }

  async getInventoryItemsByIngredient(tenantId: string, ingredientId: string): Promise<InventoryItemDocument[]> {
    return this.inventoryItemRepository.findByIngredient(tenantId, ingredientId);
  }

  async getExpiringItems(tenantId: string, days: number = 3): Promise<InventoryItemDocument[]> {
    return this.inventoryItemRepository.findExpiringItems(tenantId, days);
  }

  async getExpiredItems(tenantId: string): Promise<InventoryItemDocument[]> {
    return this.inventoryItemRepository.findExpiredItems(tenantId);
  }

  async getInventoryItemsByLocation(tenantId: string, locationId: string): Promise<InventoryItemDocument[]> {
    return this.inventoryItemRepository.findByLocation(tenantId, locationId);
  }

  async getLowStockItems(tenantId: string, thresholds: Record<string, number>): Promise<InventoryItemDocument[]> {
    return this.inventoryItemRepository.findLowStockItems(tenantId, thresholds);
  }

  async updateInventoryItem(tenantId: string, id: string, inventoryItemData: Partial<IInventoryItem>): Promise<InventoryItemDocument> {
    const updatedInventoryItem = await this.inventoryItemRepository.update(id, tenantId, inventoryItemData);
    if (!updatedInventoryItem) {
      throw new AppError('Inventory item not found', 404);
    }
    return updatedInventoryItem;
  }

  async adjustInventoryQuantity(tenantId: string, id: string, adjustment: number): Promise<InventoryItemDocument> {
    const adjustedInventoryItem = await this.inventoryItemRepository.adjustQuantity(id, tenantId, adjustment);
    if (!adjustedInventoryItem) {
      throw new AppError('Inventory item not found', 404);
    }
    return adjustedInventoryItem;
  }

  async deleteInventoryItem(tenantId: string, id: string): Promise<InventoryItemDocument> {
    const deletedInventoryItem = await this.inventoryItemRepository.delete(id, tenantId);
    if (!deletedInventoryItem) {
      throw new AppError('Inventory item not found', 404);
    }
    return deletedInventoryItem;
  }

async getIngredientForInventoryItem(inventoryItem: InventoryItemDocument): Promise<IngredientDocument> {
  // If ingredient is already populated
  if (typeof inventoryItem.ingredientId !== 'string') {
    return inventoryItem.ingredientId as unknown as IngredientDocument;
  }

  // Otherwise, fetch the ingredient
  return this.ingredientService.getIngredientById(
    inventoryItem.tenantId.toString(),
    inventoryItem.ingredientId
  );
}

  async getTotalStockByIngredient(tenantId: string, ingredientId: string): Promise<{ quantity: number, unit: string }> {
    const items = await this.getInventoryItemsByIngredient(tenantId, ingredientId);

    if (items.length === 0) {
      return { quantity: 0, unit: '' };
    }

    // Get the ingredient details to determine the default unit
    const ingredient = await this.ingredientService.getIngredientById(tenantId, ingredientId);
    const defaultUnit = ingredient.defaultUnit;

    // Calculate total quantity, converting all to the default unit
    let totalQuantity = 0;

    for (const item of items) {
      if (item.unit === defaultUnit) {
        totalQuantity += item.quantity;
      } else {
        // Try to convert to default unit
        const convertedQuantity = convertUnits(item.quantity, item.unit, defaultUnit);
        if (convertedQuantity !== null) {
          totalQuantity += convertedQuantity;
        } else {
          // If conversion not possible, log a warning but continue
          console.warn(`Could not convert ${item.quantity} ${item.unit} to ${defaultUnit} for ingredient ${ingredientId}`);
        }
      }
    }

    return { quantity: totalQuantity, unit: defaultUnit };
  }

  private validateInventoryItemData(inventoryItemData: Partial<IInventoryItem>): void {
    if (!inventoryItemData.ingredientId) {
      throw new AppError('Ingredient ID is required', 400);
    }

    if (inventoryItemData.quantity === undefined) {
      throw new AppError('Quantity is required', 400);
    }

    if (typeof inventoryItemData.quantity !== 'number' || inventoryItemData.quantity < 0) {
      throw new AppError('Quantity must be a non-negative number', 400);
    }

    if (!inventoryItemData.unit) {
      throw new AppError('Unit is required', 400);
    }

    if (!inventoryItemData.deliveryDate) {
      throw new AppError('Delivery date is required', 400);
    }

    if (!inventoryItemData.expiryDate) {
      throw new AppError('Expiry date is required', 400);
    }

    const deliveryDate = new Date(inventoryItemData.deliveryDate);
    const expiryDate = new Date(inventoryItemData.expiryDate);

    if (isNaN(deliveryDate.getTime())) {
      throw new AppError('Invalid delivery date', 400);
    }

    if (isNaN(expiryDate.getTime())) {
      throw new AppError('Invalid expiry date', 400);
    }

    if (expiryDate < deliveryDate) {
      throw new AppError('Expiry date cannot be before delivery date', 400);
    }
  }
}
