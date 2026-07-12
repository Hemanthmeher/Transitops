import { Router } from 'express';
import { MaintenanceController } from '../controllers/maintenance.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createMaintenanceSchema, updateMaintenanceSchema } from '../validators/maintenance.validator';

const router = Router();
const controller = new MaintenanceController();

router.use(authenticate);

router.get('/', controller.findAll.bind(controller));
router.get('/:id', controller.findById.bind(controller));
router.post('/', validate(createMaintenanceSchema), controller.create.bind(controller));
router.put('/:id', validate(updateMaintenanceSchema), controller.update.bind(controller));
router.delete('/:id', controller.delete.bind(controller));

export default router;
