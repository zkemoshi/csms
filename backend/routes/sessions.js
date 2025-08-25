import { Router } from 'express';
import * as ctrl from '../controllers/session_controller.js';
import { protect, admin } from '../middleware/auth.js';

const router = Router();

// Protected routes
router.get('/', protect, ctrl.getAllSessions);
router.get('/stats', protect, ctrl.getSessionStats);
router.get('/active', protect, ctrl.getActiveSessions);
router.get('/completed', protect, ctrl.getCompletedSessions);
router.get('/pending-ocpi', protect, ctrl.getPendingOcpiSessions);
router.get('/date-range', protect, ctrl.getSessionsByDateRange);
router.get('/station/:stationId', protect, ctrl.getSessionsByStation);
router.get('/user/:idTag', protect, ctrl.getSessionsByUser);
router.get('/session/:sessionId', protect, ctrl.getSessionBySessionId);
router.get('/:id', protect, ctrl.getSessionById);

router.post('/', protect, ctrl.createSession);

router.put('/:id', protect, ctrl.updateSession);
router.put('/:id/complete', protect, ctrl.completeSession);
router.put('/:id/ocpi-sent', protect, ctrl.markOcpiSent);

// Admin routes
router.delete('/:id', protect, admin, ctrl.deleteSession);

export default router;
