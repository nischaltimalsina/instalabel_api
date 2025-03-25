import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { AuthService } from "../../domain/services/authService";
import { UserService } from "../../domain/services/userService";
import { TenantService } from "../../domain/services/tenantService";
import { AppError } from "../middlewares/errorHandler";
import environment from "../../config/environment";

export class AuthController {
  private authService: AuthService;
  private userService: UserService;
  private tenantService: TenantService;

  constructor() {
    this.authService = new AuthService();
    this.userService = new UserService();
    this.tenantService = new TenantService();
  }

  async signup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { 
        firstName, 
        lastName, 
        email, 
        password,
        companyName,
        phone,
        subscriptionPlan
      } = req.body;

      // First, create a new tenant
      const tenant = await this.tenantService.createTenant({
        name: companyName,
        subscriptionPlan: subscriptionPlan || 'basic', // Default to basic plan
        contactInfo: {
          email: email,
          phone: phone
        },
        active: true
      } as any);

      // Now create the admin user associated with this tenant
      const newUser = await this.userService.createUser({
        firstName,
        lastName,
        email,
        password,
        tenantId: tenant._id.toString(),
        role: "admin", // User is automatically an admin
        isActive: true,
      });

      // Generate token
      const { user, token } = await this.authService.login({
        email,
        password,
        tenantId: tenant._id.toString(),
      });

      // Send response
      res.status(201).json({
        status: "success",
        token,
        data: {
          user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            tenantId: user.tenantId,
          },
          tenant: {
            id: tenant._id,
            name: tenant.name,
            subscriptionPlan: tenant.subscriptionPlan
          }
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, tenantId } = req.body;

      if (!email || !password) {
        throw new AppError("Please provide email and password", 400);
      }

      let userTenantId = tenantId;
      
      // If tenantId is not provided, try to find the user's tenant
      if (!userTenantId) {
        // Find user's tenant based on email
        const tenant = await this.tenantService.getTenantByEmail(email);
        if (!tenant) {
          throw new AppError("User not found", 404);
        }
        userTenantId = tenant._id.toString();
      }

      const { user, token } = await this.authService.login({
        email,
        password,
        tenantId: userTenantId,
      });

      // Send response
      res.status(200).json({
        status: "success",
        token,
        data: {
          user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            tenantId: user.tenantId,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { email, tenantId } = req.body;

      if (!email || !tenantId) {
        throw new AppError("Please provide email and tenant ID", 400);
      }

      // Generate reset token
      const resetToken = await this.authService.forgotPassword(email, tenantId);

      // In a real app, you would send an email with the reset token
      // For now, we'll just return it in the response (not secure for production)
      res.status(200).json({
        status: "success",
        message: "Token sent to email!",
        resetToken, // In production, remove this and only send via email
      });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { token } = req.params;
      const { password } = req.body;

      if (!password) {
        throw new AppError("Please provide a new password", 400);
      }

      // Reset password
      const user = await this.authService.resetPassword(token, password);

      // Generate new login token
      const loginToken = jwt.sign(
        { id: user._id, tenantId: user.tenantId, role: user.role },
        environment.jwt.secret,
        { expiresIn: parseInt(environment.jwt.expiresIn, 10) },
      );

      // Send response
      res.status(200).json({
        status: "success",
        token: loginToken,
      });
    } catch (error) {
      next(error);
    }
  }

  async updatePassword(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError("You are not logged in", 401);
      }

      if (!currentPassword || !newPassword) {
        throw new AppError("Please provide current and new password", 400);
      }

      // Update password
      await this.authService.updatePassword(
        userId,
        currentPassword,
        newPassword,
      );

      // Send response
      res.status(200).json({
        status: "success",
        message: "Password updated successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // The user ID should be available from the auth middleware
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError("Not authenticated", 401);
      }

      // Get user details from the service
      const user = await this.userService.getUserById(userId);

      // Return user data (excluding password and sensitive fields)
      res.status(200).json({
        status: "success",
        data: {
          user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            tenantId: user.tenantId,
            locationId: user.locationId,
            lastLogin: user.lastLogin,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getTenantForEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.params;

      if (!email) {
        throw new AppError("Please provide an email address", 400);
      }

      // Find tenant by email
      const tenant = await this.tenantService.getTenantByEmail(email);
      if (!tenant) {
        throw new AppError("No tenant found for this email address", 404);
      }

      // Send response with tenant information
      res.status(200).json({
        status: "success",
        data: {
          tenant: {
            id: tenant._id,
            name: tenant.name
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }
}
