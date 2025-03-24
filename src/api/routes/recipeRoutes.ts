import { Router } from 'express';
import { RecipeController } from '../controllers/recipeController';
import { protect, restrictTo } from '../middlewares/auth';

const router = Router();
const recipeController = new RecipeController();

// All routes require authentication
router.use(protect);

// Routes accessible to all authenticated users
router.get('/', (req, res, next) => recipeController.getAllRecipes(req, res, next));
router.get('/:id', (req, res, next) => recipeController.getRecipe(req, res, next));
router.get('/category/:category', (req, res, next) =>
  recipeController.getRecipesByCategory(req, res, next)
);
router.get('/status/:status', (req, res, next) =>
  recipeController.getRecipesByStatus(req, res, next)
);
router.get('/allergen/:allergen', (req, res, next) =>
  recipeController.getRecipesByAllergen(req, res, next)
);

// Routes restricted to admin and manager roles
router.use(restrictTo('admin', 'manager'));
router.post('/', (req, res, next) => recipeController.createRecipe(req, res, next));
router.put('/:id', (req, res, next) => recipeController.updateRecipe(req, res, next));
router.delete('/:id', (req, res, next) => recipeController.deleteRecipe(req, res, next));

export default router;
