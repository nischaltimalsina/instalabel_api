import { Router } from 'express';
import { SubscriptionController } from '../controllers/subscriptionController';
import { protect, restrictTo } from '../middlewares/auth';

const router = Router();
const subscriptionController = new SubscriptionController();

// All routes require authentication
router.use(protect);

// Routes for tenant admins to view their subscription
router.get('/current', (req, res, next) => subscriptionController.getSubscription(req, res, next));

// Routes restricted to admin roles
router.use(restrictTo('admin', 'superadmin'));
router.post('/', (req, res, next) => subscriptionController.createSubscription(req, res, next));
router.put('/', (req, res, next) => subscriptionController.updateSubscription(req, res, next));
router.delete('/', (req, res, next) => subscriptionController.cancelSubscription(req, res, next));

// Routes for superadmin to manage any tenant's subscription
router.use(restrictTo('superadmin'));
router.post('/:tenantId', (req, res, next) => subscriptionController.createSubscription(req, res, next));
router.get('/:tenantId', (req, res, next) => subscriptionController.getSubscription(req, res, next));
router.put('/:tenantId', (req, res, next) => subscriptionController.updateSubscription(req, res, next));
router.delete('/:tenantId', (req, res, next) => subscriptionController.cancelSubscription(req, res, next));

export default router;
