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

  async createTenantAllergen(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = req.user?.tenantId;
      const userId = req.user?.id;

      if (!tenantId || !userId) {
        throw new AppError('Tenant ID and User ID are required', 400);
      }

      // Check if user has permission to create allergens
      if (!['admin', 'manager'].includes(req.user?.role || '')) {
        throw new AppError('You do not have permission to create allergens', 403);
      }

      const allergen = await this.allergenService.createTenantAllergen(tenantId, userId, req.body);

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

      // Check if tenant-specific allergen belongs to user's tenant
      if (!allergen.isSystemLevel && allergen.tenantId?.toString() !== req.user?.tenantId) {
        throw new AppError('You do not have access to this allergen', 403);
      }

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

  async getTenantAllergens(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = req.user?.tenantId;
      if (!tenantId) {
        throw new AppError('Tenant ID is required', 400);
      }

      const allergens = await this.allergenService.getTenantAllergens(tenantId);

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
      const tenantId = req.user?.tenantId;
      if (!tenantId) {
        throw new AppError('Tenant ID is required', 400);
      }

      const allergens = await this.allergenService.getAllAccessibleAllergens(tenantId);

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

      // First, get the allergen to check permissions
      const allergen = await this.allergenService.getAllergenById(id);

      // Check if user has permission to update this allergen
      if (allergen.isSystemLevel && req.user?.role !== 'superadmin') {
        throw new AppError('Only super admins can update system allergens', 403);
      }

      if (!allergen.isSystemLevel && allergen.tenantId?.toString() !== req.user?.tenantId) {
        throw new AppError('You do not have permission to update this allergen', 403);
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

      // First, get the allergen to check permissions
      const allergen = await this.allergenService.getAllergenById(id);

      // Check if user has permission to delete this allergen
      if (allergen.isSystemLevel && req.user?.role !== 'superadmin') {
        throw new AppError('Only super admins can delete system allergens', 403);
      }

      if (!allergen.isSystemLevel && allergen.tenantId?.toString() !== req.user?.tenantId) {
        throw new AppError('You do not have permission to delete this allergen', 403);
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
