import { Application } from 'express';
import tenantRoutes from './tenantRoutes';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import { errorHandler } from '../middlewares/errorHandler';

export const setupRoutes = (app: Application): void => {
  // API routes
  app.use('/api/v1/tenants', tenantRoutes);
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/users', userRoutes);

  // 404 handler for unknown routes
  app.use('*', (req, res) => {
    res.status(404).json({
      status: 'error',
      message: `Cannot find ${req.originalUrl} on this server`
    });
  });

  // Global error handler
  app.use(errorHandler);
};
