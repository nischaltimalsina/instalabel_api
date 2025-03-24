import { Request, Response, NextFunction } from 'express';
import { TenantService } from '../../domain/services/tenantService';
import { ITenant } from '../../domain/interfaces/tenant.interface';

export class TenantController {
  private tenantService: TenantService;

  constructor() {
    this.tenantService = new TenantService();
  }

  async createTenant(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantData: ITenant = req.body;
      const tenant = await this.tenantService.createTenant(tenantData);

      res.status(201).json({
        status: 'success',
        data: {
          tenant
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getTenant(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const tenant = await this.tenantService.getTenantById(id);

      res.status(200).json({
        status: 'success',
        data: {
          tenant
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllTenants(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenants = await this.tenantService.getAllTenants();

      res.status(200).json({
        status: 'success',
        results: tenants.length,
        data: {
          tenants
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async updateTenant(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const tenantData: Partial<ITenant> = req.body;
      const tenant = await this.tenantService.updateTenant(id, tenantData);

      res.status(200).json({
        status: 'success',
        data: {
          tenant
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteTenant(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await this.tenantService.deleteTenant(id);

      res.status(204).json({
        status: 'success',
        data: null
      });
    } catch (error) {
      next(error);
    }
  }
}
