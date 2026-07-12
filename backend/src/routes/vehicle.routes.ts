import { Router } from 'express';
import { vehicleController } from '../controllers/vehicle.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/stats', vehicleController.getStats.bind(vehicleController));
router.get('/available', vehicleController.getAvailable.bind(vehicleController));
router.get('/', vehicleController.findAll.bind(vehicleController));
router.get('/:id', vehicleController.findById.bind(vehicleController));
router.post('/', authorize('ADMIN', 'MANAGER'), vehicleController.create.bind(vehicleController));
router.put('/:id', authorize('ADMIN', 'MANAGER'), vehicleController.update.bind(vehicleController));
router.delete('/:id', authorize('ADMIN'), vehicleController.delete.bind(vehicleController));

export default router;
