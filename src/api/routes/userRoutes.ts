import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { protect, restrictTo } from '../middlewares/auth';
import { checkUserLimit } from '../middlewares/subscriptionLimits';

const router = Router();
const userController = new UserController();

// All user routes require authentication
router.use(protect);

// Routes for admin and manager roles
router.use(restrictTo('admin', 'manager'));

router.post('/', checkUserLimit, (req, res, next) => userController.createUser(req, res, next));
router.get('/tenant/:tenantId', (req, res, next) => userController.getUsersByTenant(req, res, next));
router.get('/:id', (req, res, next) => userController.getUser(req, res, next));
router.patch('/:id', (req, res, next) => userController.updateUser(req, res, next));
router.delete('/:id', (req, res, next) => userController.deleteUser(req, res, next));

export default router;
