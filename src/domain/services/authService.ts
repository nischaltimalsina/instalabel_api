import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { UserRepository } from '../../infrastructure/repositories/userRepository';
import { UserDocument } from '../models/user';
import { AppError } from '../../api/middlewares/errorHandler';
import environment from '../../config/environment';
import { ObjectId } from 'mongoose';

interface LoginData {
  email: string;
  password: string;
  tenantId: string;
}

interface TokenData {
  id: ObjectId;
  tenantId: string;
  role: string;
}

export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async login(loginData: LoginData): Promise<{ user: UserDocument; token: string }> {
    const { email, password, tenantId } = loginData;

    // Find user by email and tenant
    const user = await this.userRepository.findByEmail(email, tenantId);
    if (!user) {
      throw new AppError('Incorrect email or password', 401);
    }

    // Check if user is active
    if (!user.isActive) {
      throw new AppError('Your account has been disabled', 401);
    }

    // Check if password is correct
    const passwordIsValid = await user.comparePassword(password);
    if (!passwordIsValid) {
      throw new AppError('Incorrect email or password', 401);
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Generate JWT token
    const token = this.generateToken({
      id: user._id,
      tenantId: user.tenantId.toString(),
      role: user.role
    });

    // Return user and token
    return { user, token };
  }

  async forgotPassword(email: string, tenantId: string): Promise<string> {
    // Find user by email
    const user = await this.userRepository.findByEmail(email, tenantId);
    if (!user) {
      throw new AppError('There is no user with this email address', 404);
    }

    // Generate reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    return resetToken;
  }

  async resetPassword(
    token: string,
    newPassword: string
  ): Promise<UserDocument> {
    // Hash the token to compare with the one in the database
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user by reset token and check if token is still valid
    const user = await this.userRepository.findByResetToken(token);
    if (!user) {
      throw new AppError('Token is invalid or has expired', 400);
    }

    // Update password and reset token fields
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.passwordChangedAt = new Date();

    await user.save();

    return user;
  }

  async updatePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<UserDocument> {
    // Find user by ID
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Check if current password is correct
    const passwordIsValid = await user.comparePassword(currentPassword);
    if (!passwordIsValid) {
      throw new AppError('Your current password is incorrect', 401);
    }

    // Update password
    user.password = newPassword;
    await user.save();

    return user;
  }

  private generateToken(data: TokenData): string {
    const expiresIn = parseInt(environment.jwt.expiresIn, 10);
    return jwt.sign(data, environment.jwt.secret, {
      expiresIn,
    });
  }
}
