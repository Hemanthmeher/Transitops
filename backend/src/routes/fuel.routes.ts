import { Router } from 'express';
import { FuelController } from '../controllers/fuel.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createFuelLogSchema, updateFuelLogSchema } from '../validators/fuel.validator';

const router = Router();
const controller = new FuelController();

router.use(authenticate);

router.get('/', controller.findAll.bind(controller));
router.get('/:id', controller.findById.bind(controller));
router.post('/', validate(createFuelLogSchema), controller.create.bind(controller));
router.put('/:id', validate(updateFuelLogSchema), controller.update.bind(controller));
router.delete('/:id', controller.delete.bind(controller));

export default router;
