import { Router } from 'express';
import { UsageTrackingController } from '../controllers/usageTrackingController';
import { protect, restrictTo } from '../middlewares/auth';

const router = Router();
const usageTrackingController = new UsageTrackingController();

// All routes require authentication
router.use(protect);

// Routes for tenants to check their own usage
router.get('/summary', (req, res, next) => usageTrackingController.getUsageSummary(req, res, next));
router.get('/feature/:feature', (req, res, next) => usageTrackingController.checkFeatureAccess(req, res, next));

// Routes for superadmin to check any tenant's usage
router.use(restrictTo('superadmin'));
router.get('/:tenantId/summary', (req, res, next) => usageTrackingController.getUsageSummary(req, res, next));

export default router;
