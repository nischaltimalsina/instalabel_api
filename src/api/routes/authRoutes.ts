import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { protect } from '../middlewares/auth';

const router = Router();
const authController = new AuthController();

// Public routes
router.post('/signup', (req, res, next) => authController.signup(req, res, next));
router.post('/login', (req, res, next) => authController.login(req, res, next));
router.post('/forgot-password', (req, res, next) => authController.forgotPassword(req, res, next));
router.patch('/reset-password/:token', (req, res, next) => authController.resetPassword(req, res, next));
router.get('/tenant-for-email/:email', (req, res, next) => authController.getTenantForEmail(req, res, next));

// Protected routes
router.use(protect); // Apply authentication middleware to routes below

router.get('/me', (req, res, next) => authController.getMe(req, res, next));
router.patch('/update-password', (req, res, next) => authController.updatePassword(req, res, next));

export default router;
