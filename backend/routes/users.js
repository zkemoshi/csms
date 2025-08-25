import { Router } from 'express';
import * as ctrl from '../controllers/user_controller.js';
import { protect, admin } from '../middleware/auth.js';

const router = Router();

// Public routes
router.post('/register', ctrl.register);
router.post('/login', ctrl.login);

// Protected routes
router.post('/logout', protect, ctrl.logout);
router.get('/profile', protect, ctrl.getUser);
router.put('/profile', protect, ctrl.updateUser);

// Admin routes
router.get('/', protect, admin, ctrl.getAllUsers);
router.get('/:id', protect, admin, ctrl.getUserById);
router.delete('/:id', protect, admin, ctrl.deleteUser);

export default router;
