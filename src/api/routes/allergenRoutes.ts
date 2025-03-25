import { Router } from 'express';
import { AllergenController } from '../controllers/allergenController';
import { protect, restrictTo } from '../middlewares/auth';

const router = Router();
const allergenController = new AllergenController();

// All routes require authentication
router.use(protect);

// Routes accessible to all authenticated users
router.get('/', (req, res, next) => allergenController.getSystemAllergens(req, res, next));
router.get('/system', (req, res, next) => allergenController.getSystemAllergens(req, res, next));
router.get('/:id', (req, res, next) => allergenController.getAllergen(req, res, next));

// Superadmin-only routes
router.use(restrictTo('superadmin'));
router.post('/', (req, res, next) => allergenController.createSystemAllergen(req, res, next));
router.put('/:id', (req, res, next) => allergenController.updateAllergen(req, res, next));
router.delete('/:id', (req, res, next) => allergenController.deleteAllergen(req, res, next));

export default router;
