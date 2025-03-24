import { Router } from 'express';
import { IngredientController } from '../controllers/ingredientController';
import { protect, restrictTo } from '../middlewares/auth';

const router = Router();
const ingredientController = new IngredientController();

// All routes require authentication
router.use(protect);

// Routes accessible to all authenticated users
router.get('/', (req, res, next) => ingredientController.getAllIngredients(req, res, next));
router.get('/:id', (req, res, next) => ingredientController.getIngredient(req, res, next));
router.get('/allergen/:allergen', (req, res, next) =>
  ingredientController.getIngredientsByAllergen(req, res, next)
);

// Routes restricted to admin and manager roles
router.use(restrictTo('admin', 'manager'));
router.post('/', (req, res, next) => ingredientController.createIngredient(req, res, next));
router.put('/:id', (req, res, next) => ingredientController.updateIngredient(req, res, next));
router.delete('/:id', (req, res, next) => ingredientController.deleteIngredient(req, res, next));

export default router;
