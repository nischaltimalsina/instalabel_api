import { Request, Response, NextFunction } from 'express';
import { UserService } from '../../domain/services/userService';
import { IUser } from '../../domain/interfaces/user.interface';
import { AppError } from '../middlewares/errorHandler';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Check if the user has permission for the tenant
      const { tenantId } = req.body;
      const userTenantId = req.user?.tenantId;

      if (userTenantId && tenantId !== userTenantId) {
        throw new AppError('You do not have permission to create users for this tenant', 403);
      }

      const userData: IUser = req.body;
      const user = await this.userService.createUser(userData);

      // Exclude password from response
      const userResponse = {
        ...user.toObject(),
        password: undefined
      };

      res.status(201).json({
        status: 'success',
        data: {
          user: userResponse
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = await this.userService.getUserById(id);

      // Check if user belongs to the same tenant as the requester
      if (req.user?.tenantId && user.tenantId.toString() !== req.user.tenantId) {
        throw new AppError('You do not have permission to access this user', 403);
      }

      res.status(200).json({
        status: 'success',
        data: {
          user
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getUsersByTenant(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tenantId } = req.params;

      // Check if user has permission for the tenant
      if (req.user?.tenantId && tenantId !== req.user.tenantId) {
        throw new AppError('You do not have permission to access users for this tenant', 403);
      }

      const users = await this.userService.getUsersByTenant(tenantId);

      res.status(200).json({
        status: 'success',
        results: users.length,
        data: {
          users
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userData: Partial<IUser> = req.body;

      // Get the user to check permissions
      const user = await this.userService.getUserById(id);

      // Check if user belongs to the same tenant as the requester
      if (req.user?.tenantId && user.tenantId.toString() !== req.user.tenantId) {
        throw new AppError('You do not have permission to update this user', 403);
      }

      const updatedUser = await this.userService.updateUser(id, userData);

      res.status(200).json({
        status: 'success',
        data: {
          user: updatedUser
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      // Get the user to check permissions
      const user = await this.userService.getUserById(id);

      // Check if user belongs to the same tenant as the requester
      if (req.user?.tenantId && user.tenantId.toString() !== req.user.tenantId) {
        throw new AppError('You do not have permission to delete this user', 403);
      }

      await this.userService.deleteUser(id);

      res.status(204).json({
        status: 'success',
        data: null
      });
    } catch (error) {
      next(error);
    }
  }
}
