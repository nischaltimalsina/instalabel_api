import { Request, Response, NextFunction } from 'express';
import { InventoryItemService } from '../../domain/services/inventoryItemService';
import { AppError } from '../middlewares/errorHandler';

export class InventoryItemController {
  private inventoryItemService: InventoryItemService;

  constructor() {
    this.inventoryItemService = new InventoryItemService();
  }

  async createInventoryItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = req.user?.tenantId;
      const userId = req.user?.id;

      if (!tenantId || !userId) {
        throw new AppError('Tenant ID and User ID are required', 400);
      }

      const inventoryItem = await this.inventoryItemService.createInventoryItem(tenantId, userId, req.body);

      res.status(201).json({
        status: 'success',
        data: {
          inventoryItem
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getInventoryItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError('Tenant ID is required', 400);
      }

      const inventoryItem = await this.inventoryItemService.getInventoryItemById(tenantId, id);

      res.status(200).json({
        status: 'success',
        data: {
          inventoryItem
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllInventoryItems(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = req.user?.tenantId;
      if (!tenantId) {
        throw new AppError('Tenant ID is required', 400);
      }

      // Parse any filter parameters from the query
      const filters = { ...req.query };
      // Remove pagination parameters
      ['page', 'limit', 'sort'].forEach(el => delete filters[el]);

      const inventoryItems = await this.inventoryItemService.getInventoryItemsByTenant(tenantId, filters);

      res.status(200).json({
        status: 'success',
        results: inventoryItems.length,
        data: {
          inventoryItems
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getInventoryItemsByIngredient(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { ingredientId } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError('Tenant ID is required', 400);
      }

      const inventoryItems = await this.inventoryItemService.getInventoryItemsByIngredient(tenantId, ingredientId);

      res.status(200).json({
        status: 'success',
        results: inventoryItems.length,
        data: {
          inventoryItems
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getExpiringItems(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = req.user?.tenantId;
      if (!tenantId) {
        throw new AppError('Tenant ID is required', 400);
      }

      const days = req.query.days ? parseInt(req.query.days as string) : 3;

      const inventoryItems = await this.inventoryItemService.getExpiringItems(tenantId, days);

      res.status(200).json({
        status: 'success',
        results: inventoryItems.length,
        data: {
          inventoryItems
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getExpiredItems(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = req.user?.tenantId;
      if (!tenantId) {
        throw new AppError('Tenant ID is required', 400);
      }

      const inventoryItems = await this.inventoryItemService.getExpiredItems(tenantId);

      res.status(200).json({
        status: 'success',
        results: inventoryItems.length,
        data: {
          inventoryItems
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getInventoryItemsByLocation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { locationId } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError('Tenant ID is required', 400);
      }

      const inventoryItems = await this.inventoryItemService.getInventoryItemsByLocation(tenantId, locationId);

      res.status(200).json({
        status: 'success',
        results: inventoryItems.length,
        data: {
          inventoryItems
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getLowStockItems(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = req.user?.tenantId;
      if (!tenantId) {
        throw new AppError('Tenant ID is required', 400);
      }

      const { thresholds } = req.body;

      if (!thresholds || typeof thresholds !== 'object') {
        throw new AppError('Thresholds object is required', 400);
      }

      const inventoryItems = await this.inventoryItemService.getLowStockItems(tenantId, thresholds);

      res.status(200).json({
        status: 'success',
        results: inventoryItems.length,
        data: {
          inventoryItems
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getTotalStockByIngredient(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { ingredientId } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError('Tenant ID is required', 400);
      }

      const stockInfo = await this.inventoryItemService.getTotalStockByIngredient(tenantId, ingredientId);

      res.status(200).json({
        status: 'success',
        data: {
          stockInfo
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async adjustInventoryQuantity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { adjustment } = req.body;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError('Tenant ID is required', 400);
      }

      if (adjustment === undefined || typeof adjustment !== 'number') {
        throw new AppError('Adjustment value is required and must be a number', 400);
      }

      const inventoryItem = await this.inventoryItemService.adjustInventoryQuantity(tenantId, id, adjustment);

      res.status(200).json({
        status: 'success',
        data: {
          inventoryItem
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async updateInventoryItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError('Tenant ID is required', 400);
      }

      const inventoryItem = await this.inventoryItemService.updateInventoryItem(tenantId, id, req.body);

      res.status(200).json({
        status: 'success',
        data: {
          inventoryItem
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteInventoryItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError('Tenant ID is required', 400);
      }

      await this.inventoryItemService.deleteInventoryItem(tenantId, id);

      res.status(204).json({
        status: 'success',
        data: null
      });
    } catch (error) {
      next(error);
    }
  }
}
