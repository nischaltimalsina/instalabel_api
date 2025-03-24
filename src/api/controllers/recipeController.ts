import { Request, Response, NextFunction } from 'express';
import { RecipeService } from '../../domain/services/recipeService';
import { AppError } from '../middlewares/errorHandler';

export class RecipeController {
  private recipeService: RecipeService;

  constructor() {
    this.recipeService = new RecipeService();
  }

  async createRecipe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = req.user?.tenantId;
      const userId = req.user?.id;

      if (!tenantId || !userId) {
        throw new AppError('Tenant ID and User ID are required', 400);
      }

      const recipe = await this.recipeService.createRecipe(tenantId, userId, req.body);

      res.status(201).json({
        status: 'success',
        data: {
          recipe
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getRecipe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError('Tenant ID is required', 400);
      }

      const recipe = await this.recipeService.getRecipeById(tenantId, id);

      res.status(200).json({
        status: 'success',
        data: {
          recipe
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllRecipes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = req.user?.tenantId;
      if (!tenantId) {
        throw new AppError('Tenant ID is required', 400);
      }

      // Parse any filter parameters from the query
      const filters = { ...req.query };
      // Remove pagination parameters
      ['page', 'limit', 'sort'].forEach(el => delete filters[el]);

      const recipes = await this.recipeService.getRecipesByTenant(tenantId, filters);

      res.status(200).json({
        status: 'success',
        results: recipes.length,
        data: {
          recipes
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getRecipesByCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { category } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError('Tenant ID is required', 400);
      }

      const recipes = await this.recipeService.getRecipesByCategory(tenantId, category);

      res.status(200).json({
        status: 'success',
        results: recipes.length,
        data: {
          recipes
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getRecipesByStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError('Tenant ID is required', 400);
      }

      const recipes = await this.recipeService.getRecipesByStatus(tenantId, status);

      res.status(200).json({
        status: 'success',
        results: recipes.length,
        data: {
          recipes
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getRecipesByAllergen(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { allergen } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError('Tenant ID is required', 400);
      }

      const recipes = await this.recipeService.getRecipesByAllergen(tenantId, allergen);

      res.status(200).json({
        status: 'success',
        results: recipes.length,
        data: {
          recipes
        }});
    } catch (error) {
      next(error);
    }
  }

  async updateRecipe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;
      const userId = req.user?.id;

      if (!tenantId || !userId) {
        throw new AppError('Tenant ID and User ID are required', 400);
      }

      const recipe = await this.recipeService.updateRecipe(tenantId, userId, id, req.body);

      res.status(200).json({
        status: 'success',
        data: {
          recipe
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteRecipe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError('Tenant ID is required', 400);
      }

      await this.recipeService.deleteRecipe(tenantId, id);

      res.status(204).json({
        status: 'success',
        data: null
      });
    } catch (error) {
      next(error);
    }
  }
}

