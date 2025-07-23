import { Router } from 'express';
import { PromotionController } from '../controllers/promotionController';

const router = Router();

// Basic CRUD routes
router.get('/', PromotionController.getPromotions);
router.get('/active', PromotionController.getActivePromotions);
router.get('/:id', PromotionController.getPromotionById);
router.post('/', PromotionController.createPromotion);
router.put('/:id', PromotionController.updatePromotion);
router.delete('/:id', PromotionController.deletePromotion);

// Special routes
router.patch('/:id/status', PromotionController.updatePromotionStatus);
router.get('/user/:userId', PromotionController.getPromotionsByUser);

export default router;