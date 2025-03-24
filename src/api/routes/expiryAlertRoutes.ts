import { Router } from 'express';
import { ExpiryAlertController } from '../controllers/expiryAlertController';
import { protect } from '../middlewares/auth';

const router = Router();
const expiryAlertController = new ExpiryAlertController();

// All routes require authentication
router.use(protect);

// Routes accessible to all authenticated users
router.get('/expiring', (req, res, next) => expiryAlertController.getExpiryAlerts(req, res, next));
router.get('/expired', (req, res, next) => expiryAlertController.getExpiredAlerts(req, res, next));
router.get('/report', (req, res, next) => expiryAlertController.getExpiryAlertReport(req, res, next));

export default router;
