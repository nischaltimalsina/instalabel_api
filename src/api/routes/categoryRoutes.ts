import { Router } from 'express';
import { CategoryController } from '../controllers/categoryController';
import { protect, restrictTo } from '../middlewares/auth';

const router = Router();
const categoryController = new CategoryController();

// All category routes are protected
router.use(protect);

// Routes restricted to admin only
router.post('/', restrictTo('admin'), (req, res, next) => 
  categoryController.createCategory(req, res, next));

router.patch('/:id', restrictTo('admin'), (req, res, next) => 
  categoryController.updateCategory(req, res, next));

router.delete('/:id', restrictTo('admin'), (req, res, next) => 
  categoryController.deleteCategory(req, res, next));

// Routes available to all authenticated users
router.get('/', (req, res, next) => 
  categoryController.getAllCategories(req, res, next));

router.get('/:id', (req, res, next) => 
  categoryController.getCategoryById(req, res, next));

export default router; 