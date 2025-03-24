import { IAllergen } from '../interfaces/allergen.interface';
import { AllergenRepository } from '../../infrastructure/repositories/allergenRepository';
import { AppError } from '../../api/middlewares/errorHandler';

export class AllergenService {
  private allergenRepository: AllergenRepository;

  constructor() {
    this.allergenRepository = new AllergenRepository();
  }

  async createSystemAllergen(userId: string, allergenData: Partial<IAllergen>): Promise<IAllergen> {
    // Validate allergen data
    this.validateAllergenData(allergenData);

    // Create system-level allergen
    const allergen = {
      ...allergenData,
      isSystemLevel: true,
      createdBy: userId,
      tenantId: undefined // No tenant for system allergens
    } as IAllergen;

    return this.allergenRepository.create(allergen);
  }

  async createTenantAllergen(tenantId: string, userId: string, allergenData: Partial<IAllergen>): Promise<IAllergen> {
    // Validate allergen data
    this.validateAllergenData(allergenData);

    // Create tenant-specific allergen
    const allergen = {
      ...allergenData,
      isSystemLevel: false,
      tenantId,
      createdBy: userId
    } as IAllergen;

    return this.allergenRepository.create(allergen);
  }

  async getAllergenById(id: string): Promise<IAllergen> {
    const allergen = await this.allergenRepository.findById(id);
    if (!allergen) {
      throw new AppError('Allergen not found', 404);
    }
    return allergen;
  }

  async getSystemAllergens(): Promise<IAllergen[]> {
    return this.allergenRepository.findSystemAllergens();
  }

  async getTenantAllergens(tenantId: string): Promise<IAllergen[]> {
    return this.allergenRepository.findByTenant(tenantId);
  }

  async getAllAccessibleAllergens(tenantId: string): Promise<IAllergen[]> {
    return this.allergenRepository.findAllAccessible(tenantId);
  }

  async updateAllergen(id: string, allergenData: Partial<IAllergen>): Promise<IAllergen> {
    // Prevent changing system-level status through updates
    if (allergenData.isSystemLevel !== undefined) {
      delete allergenData.isSystemLevel;
    }

    const updatedAllergen = await this.allergenRepository.update(id, allergenData);
    if (!updatedAllergen) {
      throw new AppError('Allergen not found', 404);
    }
    return updatedAllergen;
  }

  async deleteAllergen(id: string): Promise<IAllergen> {
    // Get allergen first to check if it's system-level
    const allergen = await this.getAllergenById(id);

    // Can add additional protection for system allergens here if needed

    const deletedAllergen = await this.allergenRepository.delete(id);
    if (!deletedAllergen) {
      throw new AppError('Allergen not found', 404);
    }
    return deletedAllergen;
  }

  private validateAllergenData(allergenData: Partial<IAllergen>): void {
    if (!allergenData.name) {
      throw new AppError('Allergen name is required', 400);
    }

    if (allergenData.severity && !['low', 'medium', 'high'].includes(allergenData.severity)) {
      throw new AppError('Invalid severity level. Must be low, medium, or high', 400);
    }
  }
}
