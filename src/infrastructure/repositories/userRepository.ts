import { User, UserDocument } from '../../domain/models/user';
import { IUser } from '../../domain/interfaces/user.interface';
import { AppError } from '../../api/middlewares/errorHandler';
import * as crypto from 'crypto';

export class UserRepository {
  async create(userData: IUser): Promise<UserDocument> {
    try {
      return await User.create(userData);
    } catch (error:unknown) {
      if (error instanceof Error && (error as any).code === 11000) {
        throw new AppError('User with this email already exists in this tenant', 400);
      }
      throw error;
    }
  }

  async findById(id: string): Promise<UserDocument | null> {
    return User.findById(id);
  }

  async findByEmail(email: string, tenantId: string): Promise<UserDocument | null> {
    return User.findOne({ email, tenantId }).select('+password');
  }

  async findByTenant(tenantId: string): Promise<UserDocument[]> {
    return User.find({ tenantId, isActive: true });
  }

  async update(id: string, userData: Partial<IUser>): Promise<UserDocument | null> {
    return User.findByIdAndUpdate(id, userData, {
      new: true,
      runValidators: true
    });
  }

  async updatePassword(id: string, newPassword: string): Promise<UserDocument | null> {
    const user = await User.findById(id).select('+password');
    if (!user) return null;

    user.password = newPassword;
    return user.save();
  }

  async delete(id: string): Promise<UserDocument | null> {
    // Soft delete
    return User.findByIdAndUpdate(id, { isActive: false }, { new: true });
  }

  async findByResetToken(resetToken: string): Promise<UserDocument | null> {
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    return User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });
  }
}
