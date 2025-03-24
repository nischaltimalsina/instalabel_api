import { Recipe, RecipeDocument } from '../../domain/models/recipe';
import { IRecipe } from '../../domain/interfaces/recipe.interface';
import { AppError } from '../../api/middlewares/errorHandler';

export class RecipeRepository {
  async create(recipeData: IRecipe): Promise<RecipeDocument> {
    try {
      return await Recipe.create(recipeData);
    } catch (error: unknown) {
      throw error;
    }
  }

  async findById(id: string, tenantId: string): Promise<RecipeDocument | null> {
    return Recipe.findOne({ _id: id, tenantId, isActive: true })
      .populate({
        path: 'ingredients.ingredientId',
        select: 'name allergens defaultUnit'
      });
  }

  async findByTenant(tenantId: string, query: any = {}): Promise<RecipeDocument[]> {
    const filter = { tenantId, isActive: true, ...query };
    return Recipe.find(filter)
      .populate({
        path: 'ingredients.ingredientId',
        select: 'name allergens defaultUnit'
      });
  }

  async findByName(name: string, tenantId: string): Promise<RecipeDocument | null> {
    return Recipe.findOne({ name, tenantId, isActive: true })
      .populate({
        path: 'ingredients.ingredientId',
        select: 'name allergens defaultUnit'
      });
  }

  async findByCategory(category: string, tenantId: string): Promise<RecipeDocument[]> {
    return Recipe.find({ tenantId, category, isActive: true })
      .populate({
        path: 'ingredients.ingredientId',
        select: 'name allergens defaultUnit'
      });
  }

  async findByStatus(status: string, tenantId: string): Promise<RecipeDocument[]> {
    return Recipe.find({ tenantId, status, isActive: true })
      .populate({
        path: 'ingredients.ingredientId',
        select: 'name allergens defaultUnit'
      });
  }

  async findByAllergen(allergen: string, tenantId: string): Promise<RecipeDocument[]> {
    return Recipe.find({ tenantId, allergens: allergen, isActive: true })
      .populate({
        path: 'ingredients.ingredientId',
        select: 'name allergens defaultUnit'
      });
  }

  async update(id: string, tenantId: string, recipeData: Partial<IRecipe>): Promise<RecipeDocument | null> {
    return Recipe.findOneAndUpdate(
      { _id: id, tenantId, isActive: true },
      recipeData,
      { new: true, runValidators: true }
    ).populate({
      path: 'ingredients.ingredientId',
      select: 'name allergens defaultUnit'
    });
  }

  async delete(id: string, tenantId: string): Promise<RecipeDocument | null> {
    // Soft delete
    return Recipe.findOneAndUpdate(
      { _id: id, tenantId },
      { isActive: false },
      { new: true }
    );
  }
}
