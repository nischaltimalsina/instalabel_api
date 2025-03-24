import { Document, ObjectId } from "mongoose";

export interface IUser extends Document {
  _id: ObjectId;
  tenantId: string;
  locationId?: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'admin' | 'manager' | 'staff';
  isActive: boolean;
  lastLogin?: Date;
  passwordChangedAt?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
