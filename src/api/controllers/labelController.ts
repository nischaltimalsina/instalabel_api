import { Request, Response, NextFunction } from 'express';
import { LabelService } from '../../domain/services/labelService';
import { AppError } from '../middlewares/errorHandler';
import { LabelType } from '../../domain/interfaces/label.interface';

export class LabelController {
  private labelService: LabelService;

  constructor() {
    this.labelService = new LabelService();
  }

  async createLabel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = req.user?.tenantId;
      const userId = req.user?.id;

      if (!tenantId || !userId) {
        throw new AppError('Tenant ID and User ID are required', 400);
      }

      const label = await this.labelService.createLabel(tenantId, userId, req.body);

      res.status(201).json({
        status: 'success',
        data: {
          label
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async generatePrepLabel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = req.user?.tenantId;
      const userId = req.user?.id;

      if (!tenantId || !userId) {
        throw new AppError('Tenant ID and User ID are required', 400);
      }

      const label = await this.labelService.generatePrepLabel(tenantId, userId, req.body);

      res.status(201).json({
        status: 'success',
        data: {
          label
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async generateAllergenLabel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = req.user?.tenantId;
      const userId = req.user?.id;

      if (!tenantId || !userId) {
        throw new AppError('Tenant ID and User ID are required', 400);
      }

      const label = await this.labelService.generateAllergenLabel(tenantId, userId, req.body);

      res.status(201).json({
        status: 'success',
        data: {
          label
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async generateExpiryLabel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = req.user?.tenantId;
      const userId = req.user?.id;

      if (!tenantId || !userId) {
        throw new AppError('Tenant ID and User ID are required', 400);
      }

      const label = await this.labelService.generateExpiryLabel(tenantId, userId, req.body);

      res.status(201).json({
        status: 'success',
        data: {
          label
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async generateCustomLabel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = req.user?.tenantId;
      const userId = req.user?.id;

      if (!tenantId || !userId) {
        throw new AppError('Tenant ID and User ID are required', 400);
      }

      const label = await this.labelService.generateCustomLabel(tenantId, userId, req.body);

      res.status(201).json({
        status: 'success',
        data: {
          label
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getLabel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError('Tenant ID is required', 400);
      }

      const label = await this.labelService.getLabelById(tenantId, id);

      res.status(200).json({
        status: 'success',
        data: {
          label
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllLabels(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = req.user?.tenantId;
      if (!tenantId) {
        throw new AppError('Tenant ID is required', 400);
      }

      // Parse any filter parameters from the query
      const filters = { ...req.query };
      // Remove pagination parameters
      ['page', 'limit', 'sort'].forEach(el => delete filters[el]);

      const labels = await this.labelService.getLabelsByTenant(tenantId, filters);

      res.status(200).json({
        status: 'success',
        results: labels.length,
        data: {
          labels
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getLabelsByType(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { type } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError('Tenant ID is required', 400);
      }

      // Validate label type
      if (!['prep', 'allergen', 'expiry', 'custom'].includes(type)) {
        throw new AppError('Invalid label type', 400);
      }

      const labels = await this.labelService.getLabelsByType(tenantId, type as LabelType);

      res.status(200).json({
        status: 'success',
        results: labels.length,
        data: {
          labels
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getLabelsByRecipe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { recipeId } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError('Tenant ID is required', 400);
      }

      const labels = await this.labelService.getLabelsByRecipe(tenantId, recipeId);

      res.status(200).json({
        status: 'success',
        results: labels.length,
        data: {
          labels
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async markLabelPrinted(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;
      const userId = req.user?.id;

      if (!tenantId || !userId) {
        throw new AppError('Tenant ID and User ID are required', 400);
      }

      const label = await this.labelService.markLabelPrinted(tenantId, id, userId);

      res.status(200).json({
        status: 'success',
        data: {
          label
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async batchMarkLabelsPrinted(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = req.user?.tenantId;
      const userId = req.user?.id;

      if (!tenantId || !userId) {
        throw new AppError('Tenant ID and User ID are required', 400);
      }

      const { ids } = req.body;

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        throw new AppError('Label IDs are required', 400);
      }

      const successCount = await this.labelService.batchMarkLabelsPrinted(tenantId, ids, userId);

      res.status(200).json({
        status: 'success',
        data: {
          message: `Successfully marked ${successCount} out of ${ids.length} labels as printed.`
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async updateLabel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError('Tenant ID is required', 400);
      }

      const label = await this.labelService.updateLabel(tenantId, id, req.body);

      res.status(200).json({
        status: 'success',
        data: {
          label
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteLabel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError('Tenant ID is required', 400);
      }

      await this.labelService.deleteLabel(tenantId, id);

      res.status(204).json({
        status: 'success',
        data: null
      });
    } catch (error) {
      next(error);
    }
  }
}
