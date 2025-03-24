import { IIngredient } from '../interfaces/ingredient.interface';
import { IngredientRepository } from '../../infrastructure/repositories/ingredientRepository';
import { IngredientDocument } from '../models/ingredient';
import { AppError } from '../../api/middlewares/errorHandler';

export class IngredientService {
  private ingredientRepository: IngredientRepository;

  constructor() {
    this.ingredientRepository = new IngredientRepository();
  }

  async createIngredient(tenantId: string, ingredientData: Partial<IIngredient>): Promise<IngredientDocument> {
    // Validate ingredient data
    this.validateIngredientData(ingredientData);

    // Create the ingredient with tenant ID
    const ingredient = {
      ...ingredientData,
      tenantId
    } as IIngredient;

    return this.ingredientRepository.create(ingredient);
  }

  async getIngredientById(tenantId: string, id: string): Promise<IngredientDocument> {
    const ingredient = await this.ingredientRepository.findById(id, tenantId);
    if (!ingredient) {
      throw new AppError('Ingredient not found', 404);
    }
    return ingredient;
  }

  async getIngredientsByTenant(tenantId: string, filters: any = {}): Promise<IngredientDocument[]> {
    return this.ingredientRepository.findByTenant(tenantId, filters);
  }

  async updateIngredient(tenantId: string, id: string, ingredientData: Partial<IIngredient>): Promise<IngredientDocument> {
    const updatedIngredient = await this.ingredientRepository.update(id, tenantId, ingredientData);
    if (!updatedIngredient) {
      throw new AppError('Ingredient not found', 404);
    }
    return updatedIngredient;
  }

  async deleteIngredient(tenantId: string, id: string): Promise<IngredientDocument> {
    const deletedIngredient = await this.ingredientRepository.delete(id, tenantId);
    if (!deletedIngredient) {
      throw new AppError('Ingredient not found', 404);
    }
    return deletedIngredient;
  }

  async getIngredientsByAllergen(tenantId: string, allergen: string): Promise<IngredientDocument[]> {
    return this.ingredientRepository.findByAllergen(allergen, tenantId);
  }

  private validateIngredientData(ingredientData: Partial<IIngredient>): void {
    if (!ingredientData.name) {
      throw new AppError('Ingredient name is required', 400);
    }

    if (ingredientData.allergens && !Array.isArray(ingredientData.allergens)) {
      throw new AppError('Allergens must be an array', 400);
    }

    // Additional validation as needed
  }
}
