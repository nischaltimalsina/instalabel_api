import { Ingredient, IngredientDocument } from '../../domain/models/ingredient';
import { IIngredient } from '../../domain/interfaces/ingredient.interface';
import { AppError } from '../../api/middlewares/errorHandler';

export class IngredientRepository {
  async create(ingredientData: IIngredient): Promise<IngredientDocument> {
    try {
      return await Ingredient.create(ingredientData);
    } catch (error: unknown) {
      if (error instanceof Error && (error as any).code === 11000) {
        throw new AppError('Ingredient with this name already exists for this tenant', 400);
      }
      throw error;
    }
  }

  async findById(id: string, tenantId: string): Promise<IngredientDocument | null> {
    return Ingredient.findOne({ _id: id, tenantId, isActive: true });
  }

  async findByTenant(tenantId: string, query: any = {}): Promise<IngredientDocument[]> {
    const filter = { tenantId, isActive: true, ...query };
    return Ingredient.find(filter);
  }

  async findByName(name: string, tenantId: string): Promise<IngredientDocument | null> {
    return Ingredient.findOne({ name, tenantId, isActive: true });
  }

  async findByAllergen(allergen: string, tenantId: string): Promise<IngredientDocument[]> {
    return Ingredient.find({ tenantId, allergens: allergen, isActive: true });
  }

  async update(id: string, tenantId: string, ingredientData: Partial<IIngredient>): Promise<IngredientDocument | null> {
    return Ingredient.findOneAndUpdate(
      { _id: id, tenantId, isActive: true },
      ingredientData,
      { new: true, runValidators: true }
    );
  }

  async delete(id: string, tenantId: string): Promise<IngredientDocument | null> {
    // Soft delete
    return Ingredient.findOneAndUpdate(
      { _id: id, tenantId },
      { isActive: false },
      { new: true }
    );
  }
}
