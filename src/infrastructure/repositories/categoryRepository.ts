import { Category, CategoryDocument } from '../../domain/models/category';
import { ICategory } from '../../domain/interfaces/category.interface';
import { AppError } from '../../api/middlewares/errorHandler';

export class CategoryRepository {
  async create(categoryData: Partial<ICategory>): Promise<CategoryDocument> {
    try {
      return await Category.create(categoryData);
    } catch (error: unknown) {
      if (error instanceof Error && (error as any).code === 11000) {
        throw new AppError('Category with this name already exists', 400);
      }
      throw error;
    }
  }

  async findById(id: string): Promise<CategoryDocument | null> {
    return Category.findById(id);
  }

  async findByName(name: string): Promise<CategoryDocument | null> {
    return Category.findOne({ name, isActive: true });
  }

  async findAll(): Promise<CategoryDocument[]> {
    return Category.find({ isActive: true });
  }

  async update(id: string, categoryData: Partial<ICategory>): Promise<CategoryDocument | null> {
    return Category.findByIdAndUpdate(id, categoryData, {
      new: true,
      runValidators: true
    });
  }

  async delete(id: string): Promise<CategoryDocument | null> {
    // Soft delete
    return Category.findByIdAndUpdate(id, { isActive: false }, { new: true });
  }
} 