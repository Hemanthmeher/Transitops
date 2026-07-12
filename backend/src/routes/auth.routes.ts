import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.post('/register', authController.register.bind(authController));
router.post('/login', authController.login.bind(authController));
router.post('/forgot-password', authController.forgotPassword.bind(authController));
router.post('/reset-password', authController.resetPassword.bind(authController));
router.get('/profile', authenticate, authController.getProfile.bind(authController));
router.post('/change-password', authenticate, authController.changePassword.bind(authController));

// Admin user management
router.get('/users', authenticate, authorize('ADMIN'), authController.getAllUsers.bind(authController));
router.patch('/users/:id/role', authenticate, authorize('ADMIN'), authController.updateUserRole.bind(authController));
router.delete('/users/:id', authenticate, authorize('ADMIN'), authController.deleteUser.bind(authController));

export default router;
