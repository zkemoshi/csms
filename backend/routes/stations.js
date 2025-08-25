import { Router } from 'express';
import * as ctrl from '../controllers/station_controller.js';
import { protect, admin } from '../middleware/auth.js';

const router = Router();

// Protected routes - ORDER MATTERS! More specific routes first
router.get('/', protect, ctrl.getAllStations);
router.get('/stats', protect, ctrl.getStationStats);
router.get('/online', protect, ctrl.getOnlineStations);
router.get('/offline', protect, ctrl.getOfflineStations);
router.get('/available', protect, ctrl.getAvailableStations);
router.get('/charging', protect, ctrl.getChargingStations);
router.get('/station/:stationId', protect, ctrl.getStationByStationId);
router.get('/bulk-status', protect, admin, ctrl.bulkUpdateStationStatuses);

// Generic routes - must come AFTER specific routes
router.get('/:id', protect, ctrl.getStationById);

router.post('/', protect, ctrl.createStation);

router.put('/:id', protect, ctrl.updateStation);
router.put('/:id/status', protect, ctrl.updateStationStatus);
router.put('/:id/heartbeat', protect, ctrl.updateStationHeartbeat);

// Admin routes
router.delete('/:id', protect, admin, ctrl.deleteStation);

export default router;