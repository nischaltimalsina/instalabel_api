import { Request, Response, NextFunction } from 'express';
import { CategoryService } from '../../domain/services/categoryService';
import { AppError } from '../middlewares/errorHandler';

export class CategoryController {
  private categoryService: CategoryService;

  constructor() {
    this.categoryService = new CategoryService();
  }

  async createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, description } = req.body;

      // Create new category
      const category = await this.categoryService.createCategory({
        name,
        description,
        isActive: true
      });

      // Send response
      res.status(201).json({
        status: 'success',
        data: {
          category
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await this.categoryService.getAllCategories();

      // Send response
      res.status(200).json({
        status: 'success',
        results: categories.length,
        data: {
          categories
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getCategoryById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const category = await this.categoryService.getCategoryById(id);

      // Send response
      res.status(200).json({
        status: 'success',
        data: {
          category
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async updateCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { name, description, isActive } = req.body;

      const category = await this.categoryService.updateCategory(id, {
        name,
        description,
        isActive
      });

      // Send response
      res.status(200).json({
        status: 'success',
        data: {
          category
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      await this.categoryService.deleteCategory(id);

      // Send response
      res.status(204).json({
        status: 'success',
        data: null
      });
    } catch (error) {
      next(error);
    }
  }
} 