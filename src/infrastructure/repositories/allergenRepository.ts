import { Allergen } from '../../domain/models/allergen';
import { IAllergen } from '../../domain/interfaces/allergen.interface';
import { AppError } from '../../api/middlewares/errorHandler';

export class AllergenRepository {
  async create(allergenData: IAllergen): Promise<IAllergen> {
    try {
      return await Allergen.create(allergenData);
    } catch (error: unknown) {
      if (error instanceof Error && (error as any).code === 11000) {
        throw new AppError('Allergen with this name already exists', 400);
      }
      throw error;
    }
  }

  async findById(id: string): Promise<IAllergen | null> {
    return Allergen.findById(id);
  }

  async findSystemAllergens(): Promise<IAllergen[]> {
    return Allergen.find({ isSystemLevel: true });
  }

  async findByTenant(tenantId: string): Promise<IAllergen[]> {
    return Allergen.find({ tenantId, isSystemLevel: false });
  }

  async findAllAccessible(tenantId: string): Promise<IAllergen[]> {
    // Return both system allergens and tenant-specific allergens
    return Allergen.find({
      $or: [
        { isSystemLevel: true },
        { tenantId }
      ]
    });
  }

  async update(id: string, allergenData: Partial<IAllergen>): Promise<IAllergen | null> {
    return Allergen.findByIdAndUpdate(id, allergenData, {
      new: true,
      runValidators: true
    });
  }

  async delete(id: string): Promise<IAllergen | null> {
    return Allergen.findByIdAndDelete(id);
  }
}
