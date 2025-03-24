import { Tenant, TenantDocument } from '../../domain/models/tenant';
import { ITenant } from '../../domain/interfaces/tenant.interface';
import { AppError } from '../../api/middlewares/errorHandler';

export class TenantRepository {
  async create(tenantData: ITenant): Promise<TenantDocument> {
    try {
      return await Tenant.create(tenantData);
    } catch (error: unknown) {
      if (error instanceof Error && (error as any).code === 11000) {
        throw new AppError('Tenant with this email already exists', 400);
      }
      throw error;
    }
  }

  async findById(id: string): Promise<TenantDocument | null> {
    return Tenant.findById(id);
  }

  async findByEmail(email: string): Promise<TenantDocument | null> {
    return Tenant.findOne({ 'contactInfo.email': email });
  }

  async findAll(): Promise<TenantDocument[]> {
    return Tenant.find({ active: true });
  }

  async update(id: string, tenantData: Partial<ITenant>): Promise<TenantDocument | null> {
    return Tenant.findByIdAndUpdate(id, tenantData, {
      new: true, // Return the updated document
      runValidators: true // Run model validators
    });
  }

  async delete(id: string): Promise<TenantDocument | null> {
    // Soft delete by marking as inactive
    return Tenant.findByIdAndUpdate(id, { active: false }, { new: true });
  }

  async hardDelete(id: string): Promise<boolean> {
    const result = await Tenant.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }
}
