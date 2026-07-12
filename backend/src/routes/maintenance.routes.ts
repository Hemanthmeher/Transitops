import { Router } from 'express';
import { maintenanceController } from '../controllers/maintenance.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/alerts', maintenanceController.getAlerts.bind(maintenanceController));
router.get('/', maintenanceController.findAll.bind(maintenanceController));
router.get('/:id', maintenanceController.findById.bind(maintenanceController));
router.post('/', authorize('ADMIN', 'MANAGER'), maintenanceController.create.bind(maintenanceController));
router.patch('/:id/due-soon', authorize('ADMIN', 'MANAGER'), maintenanceController.markDueSoon.bind(maintenanceController));
router.patch('/:id/complete', authorize('ADMIN', 'MANAGER'), maintenanceController.complete.bind(maintenanceController));
router.patch('/:id/cancel', authorize('ADMIN', 'MANAGER'), maintenanceController.cancel.bind(maintenanceController));
router.delete('/:id', authorize('ADMIN'), maintenanceController.delete.bind(maintenanceController));

export default router;
