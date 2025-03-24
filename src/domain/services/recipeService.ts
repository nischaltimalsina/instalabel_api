import { IRecipe, IRecipeIngredient } from '../interfaces/recipe.interface';
import { RecipeRepository } from '../../infrastructure/repositories/recipeRepository';
import { IngredientService } from './ingredientService';
import { RecipeDocument } from '../models/recipe';
import { AppError } from '../../api/middlewares/errorHandler';

export class RecipeService {
  private recipeRepository: RecipeRepository;
  private ingredientService: IngredientService;

  constructor() {
    this.recipeRepository = new RecipeRepository();
    this.ingredientService = new IngredientService();
  }

  async createRecipe(tenantId: string, userId: string, recipeData: Partial<IRecipe>): Promise<RecipeDocument> {
    // Validate recipe data
    this.validateRecipeData(recipeData);

    // Calculate allergens from ingredients
    const allergens = await this.calculateAllergens(tenantId, recipeData.ingredients || []);

    // Create the recipe with tenant ID and calculated allergens
    const recipe = {
      ...recipeData,
      tenantId,
      createdBy: userId,
      allergens,
      version: 1,
      status: recipeData.status || 'draft'
    } as IRecipe;

    return this.recipeRepository.create(recipe);
  }

  async getRecipeById(tenantId: string, id: string): Promise<RecipeDocument> {
    const recipe = await this.recipeRepository.findById(id, tenantId);
    if (!recipe) {
      throw new AppError('Recipe not found', 404);
    }
    return recipe;
  }

  async getRecipesByTenant(tenantId: string, filters: any = {}): Promise<RecipeDocument[]> {
    return this.recipeRepository.findByTenant(tenantId, filters);
  }

  async getRecipesByCategory(tenantId: string, category: string): Promise<RecipeDocument[]> {
    return this.recipeRepository.findByCategory(category, tenantId);
  }

  async getRecipesByStatus(tenantId: string, status: string): Promise<RecipeDocument[]> {
    return this.recipeRepository.findByStatus(status, tenantId);
  }

  async getRecipesByAllergen(tenantId: string, allergen: string): Promise<RecipeDocument[]> {
    return this.recipeRepository.findByAllergen(allergen, tenantId);
  }

  async updateRecipe(tenantId: string, userId: string, id: string, recipeData: Partial<IRecipe>): Promise<RecipeDocument> {
    // Get the existing recipe
    const existingRecipe = await this.getRecipeById(tenantId, id);

    // If ingredients are updated, recalculate allergens
    let allergens = existingRecipe.allergens;

    if (recipeData.ingredients) {
      allergens = await this.calculateAllergens(tenantId, recipeData.ingredients);
    }

    // Create update data with the updated allergens
    const updateData = {
      ...recipeData,
      allergens,
      updatedBy: userId
    };

    // Increment version if recipe is being published (status changing to 'active')
    if (existingRecipe.status !== 'active' && recipeData.status === 'active') {
      updateData.version = existingRecipe.version + 1;
    }

    const updatedRecipe = await this.recipeRepository.update(id, tenantId, updateData);
    if (!updatedRecipe) {
      throw new AppError('Recipe not found', 404);
    }
    return updatedRecipe;
  }

  async deleteRecipe(tenantId: string, id: string): Promise<RecipeDocument> {
    const deletedRecipe = await this.recipeRepository.delete(id, tenantId);
    if (!deletedRecipe) {
      throw new AppError('Recipe not found', 404);
    }
    return deletedRecipe;
  }

  private async calculateAllergens(tenantId: string, recipeIngredients: IRecipeIngredient[]): Promise<string[]> {
    if (!recipeIngredients || recipeIngredients.length === 0) {
      return [];
    }

    // Create a Set to avoid duplicate allergens
    const allergensSet = new Set<string>();

    // Process each ingredient and collect its allergens
    for (const recipeIngredient of recipeIngredients) {
      try {
        const ingredient = await this.ingredientService.getIngredientById(
          tenantId,
          recipeIngredient.ingredientId
        );

        // Add each allergen to the set
        if (ingredient.allergens && ingredient.allergens.length > 0) {
          ingredient.allergens.forEach(allergen => allergensSet.add(allergen));
        }
      } catch (error) {
        // If ingredient is not found, skip it
        console.error(`Ingredient ${recipeIngredient.ingredientId} not found`);
      }
    }

    // Convert Set to Array
    return Array.from(allergensSet);
  }

  private validateRecipeData(recipeData: Partial<IRecipe>): void {
    if (!recipeData.name) {
      throw new AppError('Recipe name is required', 400);
    }

    if (recipeData.status && !['draft', 'active', 'archived'].includes(recipeData.status)) {
      throw new AppError('Invalid status. Must be draft, active, or archived', 400);
    }

    if (recipeData.ingredients && !Array.isArray(recipeData.ingredients)) {
      throw new AppError('Ingredients must be an array', 400);
    }

    // Validate each ingredient in the recipe
    if (recipeData.ingredients && recipeData.ingredients.length > 0) {
      recipeData.ingredients.forEach((ingredient, index) => {
        if (!ingredient.ingredientId) {
          throw new AppError(`Ingredient at index ${index} is missing ingredientId`, 400);
        }

        if (typeof ingredient.quantity !== 'number' || ingredient.quantity < 0) {
          throw new AppError(`Ingredient at index ${index} has invalid quantity`, 400);
        }

        if (!ingredient.unit) {
          throw new AppError(`Ingredient at index ${index} is missing unit`, 400);
        }
      });
    }

    // Additional validation as needed
  }
}
