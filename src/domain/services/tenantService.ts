import { ITenant } from '../interfaces/tenant.interface';
import { TenantRepository } from '../../infrastructure/repositories/tenantRepository';
import { TenantDocument } from '../models/tenant';
import { AppError } from '../../api/middlewares/errorHandler';

export class TenantService {
  private tenantRepository: TenantRepository;

  constructor() {
    this.tenantRepository = new TenantRepository();
  }

  async createTenant(tenantData: ITenant): Promise<TenantDocument> {
    // Validate tenant data
    this.validateTenantData(tenantData);

    // Create the tenant
    return this.tenantRepository.create(tenantData);
  }

  async getTenantById(id: string): Promise<TenantDocument> {
    const tenant = await this.tenantRepository.findById(id);
    if (!tenant) {
      throw new AppError('Tenant not found', 404);
    }
    return tenant;
  }

  async getTenantByEmail(email: string): Promise<TenantDocument | null> {
    return this.tenantRepository.findByEmail(email);
  }

  async getAllTenants(): Promise<TenantDocument[]> {
    return this.tenantRepository.findAll();
  }

  async updateTenant(id: string, tenantData: Partial<ITenant>): Promise<TenantDocument> {
    const updatedTenant = await this.tenantRepository.update(id, tenantData);
    if (!updatedTenant) {
      throw new AppError('Tenant not found', 404);
    }
    return updatedTenant;
  }

  async deleteTenant(id: string): Promise<TenantDocument> {
    const deletedTenant = await this.tenantRepository.delete(id);
    if (!deletedTenant) {
      throw new AppError('Tenant not found', 404);
    }
    return deletedTenant;
  }

  private validateTenantData(tenantData: ITenant): void {
    // Add validation logic here
    if (!tenantData.name) {
      throw new AppError('Tenant name is required', 400);
    }

    if (!tenantData.contactInfo || !tenantData.contactInfo.email) {
      throw new AppError('Tenant email is required', 400);
    }

    // Add more validation as needed
  }
}
