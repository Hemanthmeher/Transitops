import { Router } from 'express';
import { DriverController } from '../controllers/driver.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createDriverSchema, updateDriverSchema } from '../validators/driver.validator';

const router = Router();
const controller = new DriverController();

router.use(authenticate);

router.get('/available', controller.getAvailable.bind(controller));
router.get('/', controller.findAll.bind(controller));
router.get('/:id', controller.findById.bind(controller));
router.post('/', authorize('ADMIN', 'MANAGER'), validate(createDriverSchema), controller.create.bind(controller));
router.put('/:id', authorize('ADMIN', 'MANAGER'), validate(updateDriverSchema), controller.update.bind(controller));
router.delete('/:id', authorize('ADMIN'), controller.delete.bind(controller));

export default router;
