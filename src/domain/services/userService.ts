import { IUser } from '../interfaces/user.interface';
import { UserRepository } from '../../infrastructure/repositories/userRepository';
import { UserDocument } from '../models/user';
import { AppError } from '../../api/middlewares/errorHandler';

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async createUser(userData: IUser): Promise<UserDocument> {
    // Validate user data
    this.validateUserData(userData);

    // Create the user
    return this.userRepository.create(userData);
  }

  async getUserById(id: string): Promise<UserDocument> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }

  async getUsersByTenant(tenantId: string): Promise<UserDocument[]> {
    return this.userRepository.findByTenant(tenantId);
  }

  async updateUser(id: string, userData: Partial<IUser>): Promise<UserDocument> {
    // Prevent password updates through this method
    if (userData.password) {
      delete userData.password;
    }

    const updatedUser = await this.userRepository.update(id, userData);
    if (!updatedUser) {
      throw new AppError('User not found', 404);
    }
    return updatedUser;
  }

  async deleteUser(id: string): Promise<UserDocument> {
    const deletedUser = await this.userRepository.delete(id);
    if (!deletedUser) {
      throw new AppError('User not found', 404);
    }
    return deletedUser;
  }

  private validateUserData(userData: IUser): void {
    if (!userData.email) {
      throw new AppError('Email is required', 400);
    }

    if (!userData.password) {
      throw new AppError('Password is required', 400);
    }

    if (userData.password.length < 8) {
      throw new AppError('Password must be at least 8 characters long', 400);
    }

    if (!userData.firstName || !userData.lastName) {
      throw new AppError('First name and last name are required', 400);
    }

    if (!userData.tenantId) {
      throw new AppError('Tenant ID is required', 400);
    }
  }
}
