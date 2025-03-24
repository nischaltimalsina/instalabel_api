import { Router } from 'express';
import { AdminSubscriptionController } from '../controllers/adminSubscriptionController';
import { protect, restrictTo } from '../middlewares/auth';

const router = Router();
const adminSubscriptionController = new AdminSubscriptionController();

// All routes require authentication and superadmin role
router.use(protect);
router.use(restrictTo('superadmin'));

// Subscription management routes
router.get('/subscriptions', (req, res, next) =>
  adminSubscriptionController.getAllSubscriptions(req, res, next)
);
router.get('/subscriptions/plan/:plan', (req, res, next) =>
  adminSubscriptionController.getSubscriptionsByPlan(req, res, next)
);
router.get('/subscriptions/analytics', (req, res, next) =>
  adminSubscriptionController.getSubscriptionAnalytics(req, res, next)
);

export default router;
