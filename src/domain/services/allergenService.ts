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
  }
}
