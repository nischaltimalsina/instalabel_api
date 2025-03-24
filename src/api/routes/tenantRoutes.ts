import { Router } from 'express';
import { TenantController } from '../controllers/tenantController';

const router = Router();
const tenantController = new TenantController();

// Note: We'll add authentication middleware later
router.post('/', (req, res, next) => tenantController.createTenant(req, res, next));
router.get('/', (req, res, next) => tenantController.getAllTenants(req, res, next));
router.get('/:id', (req, res, next) => tenantController.getTenant(req, res, next));
router.put('/:id', (req, res, next) => tenantController.updateTenant(req, res, next));
router.delete('/:id', (req, res, next) => tenantController.deleteTenant(req, res, next));

export default router;
