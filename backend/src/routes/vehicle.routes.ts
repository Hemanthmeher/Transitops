import { Router } from 'express';
import { VehicleController } from '../controllers/vehicle.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createVehicleSchema, updateVehicleSchema } from '../validators/vehicle.validator';

const router = Router();
const controller = new VehicleController();

router.use(authenticate);

router.get('/available', controller.getAvailable.bind(controller));
router.get('/', controller.findAll.bind(controller));
router.get('/:id', controller.findById.bind(controller));
router.post('/', authorize('ADMIN', 'MANAGER'), validate(createVehicleSchema), controller.create.bind(controller));
router.put('/:id', authorize('ADMIN', 'MANAGER'), validate(updateVehicleSchema), controller.update.bind(controller));
router.delete('/:id', authorize('ADMIN'), controller.delete.bind(controller));

export default router;
