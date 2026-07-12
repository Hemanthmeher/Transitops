import { Router } from 'express';
import { driverController } from '../controllers/driver.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/stats', driverController.getStats.bind(driverController));
router.get('/available', driverController.getAvailable.bind(driverController));
router.get('/', driverController.findAll.bind(driverController));
router.get('/:id', driverController.findById.bind(driverController));
router.post('/', authorize('ADMIN', 'MANAGER'), driverController.create.bind(driverController));
router.put('/:id', authorize('ADMIN', 'MANAGER'), driverController.update.bind(driverController));
router.patch('/:id/status', authorize('ADMIN', 'MANAGER', 'DISPATCHER'), driverController.updateStatus.bind(driverController));
router.delete('/:id', authorize('ADMIN'), driverController.delete.bind(driverController));

export default router;
