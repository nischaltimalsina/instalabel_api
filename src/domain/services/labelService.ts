import { ILabel, LabelType } from '../interfaces/label.interface';
import { LabelRepository } from '../../infrastructure/repositories/labelRepository';
import { RecipeService } from './recipeService';
import { InventoryItemService } from './inventoryItemService';
import { LabelDocument } from '../models/label';
import { AppError } from '../../api/middlewares/errorHandler';
import { generateBarcode } from '../../utils/barcodeGenerator';

export class LabelService {
  private labelRepository: LabelRepository;
  private recipeService: RecipeService;
  private inventoryItemService: InventoryItemService;

  constructor() {
    this.labelRepository = new LabelRepository();
    this.recipeService = new RecipeService();
    this.inventoryItemService = new InventoryItemService();
  }

  async createLabel(tenantId: string, userId: string, labelData: Partial<ILabel>): Promise<LabelDocument> {
    // Validate label data
    this.validateLabelData(labelData);

    // Create the label with tenant ID
    const label = {
      ...labelData,
      tenantId,
      createdBy: userId,
      isActive: true
    } as ILabel;

    return this.labelRepository.create(label);
  }

  async generatePrepLabel(tenantId: string, userId: string, data: {
    recipeId: string;
    preparedBy?: string;
    prepDate?: Date;
    useByDays?: number;
    additionalInfo?: string;
    locationId?: string;
  }): Promise<LabelDocument> {
    // Get recipe details
    const recipe = await this.recipeService.getRecipeById(tenantId, data.recipeId);

    // Calculate use-by date based on prep date (default: today) and days until expiry
    const prepDate = data.prepDate || new Date();
    const useByDate = new Date(prepDate);
    useByDate.setDate(useByDate.getDate() + (data.useByDays || 3)); // Default: 3 days

    // Generate barcode data - a simple identifier for the label
    const barcodeData = `PREP-${recipe._id}-${prepDate.getTime()}`;

    // Create the prep label
    const label: Partial<ILabel> = {
      labelType: 'prep',
      name: `Prep Label: ${recipe.name}`,
      recipeId: data.recipeId,
      locationId: data.locationId,
      content: {
        recipeName: recipe.name,
        preparedBy: data.preparedBy,
        prepDate: prepDate,
        useByDate: useByDate,
        allergens: recipe.allergens,
        ingredients: recipe.ingredients.map(i => {
          // Handle both populated and non-populated ingredient references
          const ingredientName = typeof i.ingredientId === 'string'
            ? 'Ingredient' // Fallback if not populated
            : (i.ingredientId as any).name; // Access name if populated
          return `${ingredientName} (${i.quantity}${i.unit})`;
        }).join(', '),
        additionalInfo: data.additionalInfo,
        barcodeData: generateBarcode(barcodeData) // We're still using the same field, just with barcode data now
      }
    };

    return this.createLabel(tenantId, userId, label);
  }

  async generateAllergenLabel(tenantId: string, userId: string, data: {
    recipeId: string;
    additionalInfo?: string;
    locationId?: string;
  }): Promise<LabelDocument> {
    // Get recipe details
    const recipe = await this.recipeService.getRecipeById(tenantId, data.recipeId);

    // Generate barcode data
    const barcodeData = `ALLG-${recipe._id}-${Date.now()}`;

    // Create the allergen label
    const label: Partial<ILabel> = {
      labelType: 'allergen',
      name: `Allergen Label: ${recipe.name}`,
      recipeId: data.recipeId,
      locationId: data.locationId,
      content: {
        recipeName: recipe.name,
        allergens: recipe.allergens,
        ingredients: recipe.ingredients.map(i => {
          // Handle both populated and non-populated ingredient references
          const ingredientName = typeof i.ingredientId === 'string'
            ? 'Ingredient' // Fallback if not populated
            : (i.ingredientId as any).name; // Access name if populated
          return `${ingredientName} (${i.quantity}${i.unit})`;
        }).join(', '),
        additionalInfo: data.additionalInfo,
        barcodeData: generateBarcode(barcodeData)
      }
    };

    return this.createLabel(tenantId, userId, label);
  }

  async generateExpiryLabel(tenantId: string, userId: string, data: {
    inventoryItemId: string;
    storageInstructions?: string;
    additionalInfo?: string;
    locationId?: string;
  }): Promise<LabelDocument> {
    // Get inventory item details
    const inventoryItem = await this.inventoryItemService.getInventoryItemById(tenantId, data.inventoryItemId);

    // Get the ingredient details
    const ingredient = await this.inventoryItemService.getIngredientForInventoryItem(inventoryItem);

    // Generate barcode data
    const barcodeData = `EXP-${inventoryItem._id}-${inventoryItem.expiryDate.getTime()}`;

    // Create the expiry label
    const label: Partial<ILabel> = {
      labelType: 'expiry',
      name: `Expiry Label: ${ingredient.name}`,
      inventoryItemId: data.inventoryItemId,
      locationId: data.locationId,
      content: {
        recipeName: ingredient.name, // Using recipeName field for ingredient name
        expiryDate: inventoryItem.expiryDate,
        allergens: ingredient.allergens,
        storageInstructions: data.storageInstructions || 'Store according to ingredient requirements',
        additionalInfo: data.additionalInfo,
        barcodeData: generateBarcode(barcodeData)
      }
    };

    return this.createLabel(tenantId, userId, label);
  }

  async generateCustomLabel(tenantId: string, userId: string, data: {
    name: string;
    content: {
      recipeName?: string;
      preparedBy?: string;
      prepDate?: Date;
      useByDate?: Date;
      expiryDate?: Date;
      allergens?: string[];
      ingredients?: string;
      storageInstructions?: string;
      additionalInfo?: string;
    };
    recipeId?: string;
    inventoryItemId?: string;
    locationId?: string;
  }): Promise<LabelDocument> {
    // Generate barcode data
    const barcodeData = `CUSTOM-${tenantId}-${Date.now()}`;

    // Create the custom label
    const label: Partial<ILabel> = {
      labelType: 'custom',
      name: data.name,
      recipeId: data.recipeId,
      inventoryItemId: data.inventoryItemId,
      locationId: data.locationId,
      content: {
        ...data.content,
        barcodeData: generateBarcode(barcodeData)
      }
    };

    return this.createLabel(tenantId, userId, label);
  }

  // Other methods remain the same
  async getLabelById(tenantId: string, id: string): Promise<LabelDocument> {
    const label = await this.labelRepository.findById(id, tenantId);
    if (!label) {
      throw new AppError('Label not found', 404);
    }
    return label;
  }

  async getLabelsByTenant(tenantId: string, filters: any = {}): Promise<LabelDocument[]> {
    return this.labelRepository.findByTenant(tenantId, filters);
  }

  async getLabelsByType(tenantId: string, labelType: LabelType): Promise<LabelDocument[]> {
    return this.labelRepository.findByType(tenantId, labelType);
  }

  async getLabelsByRecipe(tenantId: string, recipeId: string): Promise<LabelDocument[]> {
    return this.labelRepository.findByRecipe(tenantId, recipeId);
  }

  async getLabelsByInventoryItem(tenantId: string, inventoryItemId: string): Promise<LabelDocument[]> {
    return this.labelRepository.findByInventoryItem(tenantId, inventoryItemId);
  }

  async updateLabel(tenantId: string, id: string, labelData: Partial<ILabel>): Promise<LabelDocument> {
    const updatedLabel = await this.labelRepository.update(id, tenantId, labelData);
    if (!updatedLabel) {
      throw new AppError('Label not found', 404);
    }
    return updatedLabel;
  }

  async markLabelPrinted(tenantId: string, id: string, userId: string): Promise<LabelDocument> {
    const printedLabel = await this.labelRepository.markPrinted(id, tenantId, userId);
    if (!printedLabel) {
      throw new AppError('Label not found', 404);
    }
    return printedLabel;
  }

  async batchMarkLabelsPrinted(tenantId: string, ids: string[], userId: string): Promise<number> {
    let successCount = 0;

    for (const id of ids) {
      try {
        await this.markLabelPrinted(tenantId, id, userId);
        successCount++;
      } catch (error) {
        console.error(`Failed to mark label ${id} as printed:`, error);
      }
    }

    return successCount;
  }

  async deleteLabel(tenantId: string, id: string): Promise<LabelDocument> {
    const deletedLabel = await this.labelRepository.delete(id, tenantId);
    if (!deletedLabel) {
      throw new AppError('Label not found', 404);
    }
    return deletedLabel;
  }

  private validateLabelData(labelData: Partial<ILabel>): void {
    if (!labelData.labelType) {
      throw new AppError('Label type is required', 400);
    }

    if (!['prep', 'allergen', 'expiry', 'custom'].includes(labelData.labelType)) {
      throw new AppError('Invalid label type', 400);
    }

    if (!labelData.name) {
      throw new AppError('Label name is required', 400);
    }

    // Additional validation based on label type
    if (labelData.labelType === 'prep' && !labelData.recipeId) {
      throw new AppError('Recipe ID is required for prep labels', 400);
    }

    if (labelData.labelType === 'allergen' && !labelData.recipeId) {
      throw new AppError('Recipe ID is required for allergen labels', 400);
    }

    if (labelData.labelType === 'expiry' && !labelData.inventoryItemId) {
      throw new AppError('Inventory item ID is required for expiry labels', 400);
    }
  }
}
