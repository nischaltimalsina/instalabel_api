import { Request, Response, NextFunction } from 'express';
import { AllergenService } from '../../domain/services/allergenService';
import { AppError } from '../middlewares/errorHandler';

export class AllergenController {
  private allergenService: AllergenService;

  constructor() {
    this.allergenService = new AllergenService();
  }

  async createSystemAllergen(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Only super admins can create system allergens
      if (req.user?.role !== 'superadmin') {
        throw new AppError('Only super admins can create system allergens', 403);
      }

      const userId = req.user.id;
      const allergen = await this.allergenService.createSystemAllergen(userId, req.body);

      res.status(201).json({
        status: 'success',
        data: {
          allergen
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllergen(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const allergen = await this.allergenService.getAllergenById(id);

      res.status(200).json({
        status: 'success',
        data: {
          allergen
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getSystemAllergens(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const allergens = await this.allergenService.getSystemAllergens();

      res.status(200).json({
        status: 'success',
        results: allergens.length,
        data: {
          allergens
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllAccessibleAllergens(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const allergens = await this.allergenService.getSystemAllergens();

      res.status(200).json({
        status: 'success',
        results: allergens.length,
        data: {
          allergens
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async updateAllergen(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      // Only super admins can update allergens
      if (req.user?.role !== 'superadmin') {
        throw new AppError('Only super admins can update allergens', 403);
      }

      const updatedAllergen = await this.allergenService.updateAllergen(id, req.body);

      res.status(200).json({
        status: 'success',
        data: {
          allergen: updatedAllergen
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteAllergen(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      // Only super admins can delete allergens
      if (req.user?.role !== 'superadmin') {
        throw new AppError('Only super admins can delete allergens', 403);
      }

      await this.allergenService.deleteAllergen(id);

      res.status(204).json({
        status: 'success',
        data: null
      });
    } catch (error) {
      next(error);
    }
  }
}
