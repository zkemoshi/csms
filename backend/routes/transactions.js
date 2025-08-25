import { Router } from 'express';
import * as ctrl from '../controllers/transaction_controller.js';
import { protect, admin } from '../middleware/auth.js';

const router = Router();

// Protected routes
router.get('/', protect, ctrl.getAllTransactions);
router.get('/stats', protect, ctrl.getTransactionStats);
router.get('/active', protect, ctrl.getActiveTransactions);
router.get('/station/:stationId', protect, ctrl.getTransactionsByStation);
router.get('/transaction/:transactionId', protect, ctrl.getTransactionByTransactionId);
router.get('/:id', protect, ctrl.getTransactionById);

router.post('/', protect, ctrl.createTransaction);
router.post('/:id/meter-values', protect, ctrl.addMeterValues);

router.put('/:id', protect, ctrl.updateTransaction);
router.put('/:id/stop', protect, ctrl.stopTransaction);

// Admin routes
router.delete('/:id', protect, admin, ctrl.deleteTransaction);

export default router;
