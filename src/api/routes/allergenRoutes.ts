import { Router } from 'express';
import { AllergenController } from '../controllers/allergenController';
import { protect, restrictTo } from '../middlewares/auth';

const router = Router();
const allergenController = new AllergenController();

// All routes require authentication
router.use(protect);

// Routes accessible to all authenticated users
router.get('/system', (req, res, next) => allergenController.getSystemAllergens(req, res, next));
router.get('/tenant', (req, res, next) => allergenController.getTenantAllergens(req, res, next));
router.get('/all', (req, res, next) => allergenController.getAllAccessibleAllergens(req, res, next));
router.get('/:id', (req, res, next) => allergenController.getAllergen(req, res, next));

// Routes restricted to admin and manager roles
router.use(restrictTo('admin', 'manager'));
router.post('/tenant', (req, res, next) => allergenController.createTenantAllergen(req, res, next));
router.put('/:id', (req, res, next) => allergenController.updateAllergen(req, res, next));
router.delete('/:id', (req, res, next) => allergenController.deleteAllergen(req, res, next));

// Superadmin-only routes
router.post('/system', restrictTo('superadmin'), (req, res, next) =>
  allergenController.createSystemAllergen(req, res, next)
);

export default router;
