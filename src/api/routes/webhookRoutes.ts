import { Router } from 'express';
import { WebhookController } from '../controllers/webhookController';

const router = Router();
const webhookController = new WebhookController();

// Stripe webhook doesn't use standard authentication
router.post('/stripe', (req, res, next) => webhookController.handleStripeWebhook(req, res, next));

export default router;
