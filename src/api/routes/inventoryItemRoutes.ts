import { Router } from 'express';
import { InventoryItemController } from '../controllers/inventoryItemController';
import { protect, restrictTo } from '../middlewares/auth';

const router = Router();
const inventoryItemController = new InventoryItemController();

// All routes require authentication
router.use(protect);

// Routes accessible to all authenticated users
router.get('/', (req, res, next) => inventoryItemController.getAllInventoryItems(req, res, next));
router.get('/:id', (req, res, next) => inventoryItemController.getInventoryItem(req, res, next));
router.get('/ingredient/:ingredientId', (req, res, next) =>
  inventoryItemController.getInventoryItemsByIngredient(req, res, next)
);
router.get('/location/:locationId', (req, res, next) =>
  inventoryItemController.getInventoryItemsByLocation(req, res, next)
);
router.get('/expiring/items', (req, res, next) =>
  inventoryItemController.getExpiringItems(req, res, next)
);
router.get('/expired/items', (req, res, next) =>
  inventoryItemController.getExpiredItems(req, res, next)
);
router.get('/ingredient/:ingredientId/total', (req, res, next) =>
  inventoryItemController.getTotalStockByIngredient(req, res, next)
);

// Routes for all staff to adjust inventory
router.patch('/:id/adjust', (req, res, next) =>
  inventoryItemController.adjustInventoryQuantity(req, res, next)
);

// Routes restricted to admin and manager roles
router.use(restrictTo('admin', 'manager'));
router.post('/', (req, res, next) => inventoryItemController.createInventoryItem(req, res, next));
router.post('/low-stock', (req, res, next) => inventoryItemController.getLowStockItems(req, res, next));
router.put('/:id', (req, res, next) => inventoryItemController.updateInventoryItem(req, res, next));
router.delete('/:id', (req, res, next) => inventoryItemController.deleteInventoryItem(req, res, next));

export default router;
