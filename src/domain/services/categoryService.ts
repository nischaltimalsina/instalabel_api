import { ICategory } from '../interfaces/category.interface';
import { CategoryRepository } from '../../infrastructure/repositories/categoryRepository';
import { CategoryDocument } from '../models/category';
import { AppError } from '../../api/middlewares/errorHandler';

export class CategoryService {
  private categoryRepository: CategoryRepository;

  constructor() {
    this.categoryRepository = new CategoryRepository();
  }

  async createCategory(categoryData: Partial<ICategory>): Promise<CategoryDocument> {
    // Validate category data
    this.validateCategoryData(categoryData);

    // Create the category
    return this.categoryRepository.create(categoryData);
  }

  async getCategoryById(id: string): Promise<CategoryDocument> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new AppError('Category not found', 404);
    }
    return category;
  }

  async getCategoryByName(name: string): Promise<CategoryDocument | null> {
    return this.categoryRepository.findByName(name);
  }

  async getAllCategories(): Promise<CategoryDocument[]> {
    return this.categoryRepository.findAll();
  }

  async updateCategory(id: string, categoryData: Partial<ICategory>): Promise<CategoryDocument> {
    const updatedCategory = await this.categoryRepository.update(id, categoryData);
    if (!updatedCategory) {
      throw new AppError('Category not found', 404);
    }
    return updatedCategory;
  }

  async deleteCategory(id: string): Promise<CategoryDocument> {
    const deletedCategory = await this.categoryRepository.delete(id);
    if (!deletedCategory) {
      throw new AppError('Category not found', 404);
    }
    return deletedCategory;
  }

  private validateCategoryData(categoryData: Partial<ICategory>): void {
    if (!categoryData.name) {
      throw new AppError('Category name is required', 400);
    }
  }
} 