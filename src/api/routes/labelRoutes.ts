import { Router } from 'express';
import { LabelController } from '../controllers/labelController';
import { protect, restrictTo } from '../middlewares/auth';

const router = Router();
const labelController = new LabelController();

// All routes require authentication
router.use(protect);

// Routes accessible to all authenticated users
router.get('/', (req, res, next) => labelController.getAllLabels(req, res, next));
router.get('/:id', (req, res, next) => labelController.getLabel(req, res, next));
router.get('/type/:type', (req, res, next) => labelController.getLabelsByType(req, res, next));
router.get('/recipe/:recipeId', (req, res, next) => labelController.getLabelsByRecipe(req, res, next));

// Routes for printing labels (available to all staff)
router.patch('/:id/print', (req, res, next) => labelController.markLabelPrinted(req, res, next));
router.post('/batch-print', (req, res, next) => labelController.batchMarkLabelsPrinted(req, res, next));

// Routes for generating labels (available to all staff)
router.post('/prep', (req, res, next) => labelController.generatePrepLabel(req, res, next));
router.post('/allergen', (req, res, next) => labelController.generateAllergenLabel(req, res, next));
router.post('/expiry', (req, res, next) => labelController.generateExpiryLabel(req, res, next));

// Routes restricted to admin and manager roles
router.use(restrictTo('admin', 'manager'));
router.post('/custom', (req, res, next) => labelController.generateCustomLabel(req, res, next));
router.post('/', (req, res, next) => labelController.createLabel(req, res, next));
router.put('/:id', (req, res, next) => labelController.updateLabel(req, res, next));
router.delete('/:id', (req, res, next) => labelController.deleteLabel(req, res, next));

export default router;
