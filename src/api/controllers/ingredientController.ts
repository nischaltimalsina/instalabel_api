import { Request, Response, NextFunction } from 'express';
import { IngredientService } from '../../domain/services/ingredientService';
import { AppError } from '../middlewares/errorHandler';

export class IngredientController {
  private ingredientService: IngredientService;

  constructor() {
    this.ingredientService = new IngredientService();
  }

  async createIngredient(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = req.user?.tenantId;
      if (!tenantId) {
        throw new AppError('Tenant ID is required', 400);
      }

      const ingredient = await this.ingredientService.createIngredient(tenantId, req.body);

      res.status(201).json({
        status: 'success',
        data: {
          ingredient
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getIngredient(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError('Tenant ID is required', 400);
      }

      const ingredient = await this.ingredientService.getIngredientById(tenantId, id);

      res.status(200).json({
        status: 'success',
        data: {
          ingredient
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllIngredients(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = req.user?.tenantId;
      if (!tenantId) {
        throw new AppError('Tenant ID is required', 400);
      }

      // Parse any filter parameters from the query
      const filters = { ...req.query };
      // Remove pagination parameters
      ['page', 'limit', 'sort'].forEach(el => delete filters[el]);

      const ingredients = await this.ingredientService.getIngredientsByTenant(tenantId, filters);

      res.status(200).json({
        status: 'success',
        results: ingredients.length,
        data: {
          ingredients
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async updateIngredient(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError('Tenant ID is required', 400);
      }

      const ingredient = await this.ingredientService.updateIngredient(tenantId, id, req.body);

      res.status(200).json({
        status: 'success',
        data: {
          ingredient
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteIngredient(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError('Tenant ID is required', 400);
      }

      await this.ingredientService.deleteIngredient(tenantId, id);

      res.status(204).json({
        status: 'success',
        data: null
      });
    } catch (error) {
      next(error);
    }
  }

  async getIngredientsByAllergen(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { allergen } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError('Tenant ID is required', 400);
      }

      const ingredients = await this.ingredientService.getIngredientsByAllergen(tenantId, allergen);

      res.status(200).json({
        status: 'success',
        results: ingredients.length,
        data: {
          ingredients
        }
      });
    } catch (error) {
      next(error);
    }
  }
}
