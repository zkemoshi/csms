import { Router } from 'express';
import * as ctrl from '../controllers/token_controller.js';
import { protect } from '../middleware/auth.js';

const router = Router();

// Protected routes - ORDER MATTERS! More specific routes first
router.get('/', protect, ctrl.list);
router.post('/', protect, ctrl.create);

// Authorization settings - must come BEFORE generic :idTag routes
router.get('/settings/authorization', protect, ctrl.getAuthorizationSettings);
router.put('/settings/authorization', protect, ctrl.updateAuthorizationSettings);

// Generic routes - must come AFTER specific routes
router.get('/:idTag', protect, ctrl.read);
router.put('/:idTag', protect, ctrl.update);
router.delete('/:idTag', protect, ctrl.remove);

// quick actions
router.post('/:idTag/activate', protect, ctrl.activate);
router.post('/:idTag/block', protect, ctrl.block);

export default router;